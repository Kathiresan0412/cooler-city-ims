"use server";

import { Prisma, ShiftDayStatus, ShiftSwapStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Enter a valid date");

const createSchema = z.object({
  recipientId: z.string().min(1),
  requesterDate: dateSchema,
  recipientDate: dateSchema,
  note: z.string().trim().max(250).optional(),
});

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

async function loadAssignments(
  transaction: Prisma.TransactionClient,
  userIds: string[],
  dates: Date[]
): Promise<AssignmentSource[]> {
  const through = new Date(Math.max(...dates.map((date) => date.getTime())));
  return transaction.user.findMany({
    where: { id: { in: userIds }, isActive: true },
    include: {
      shiftSchedules: {
        where: { startsOn: { lte: through } },
        orderBy: [{ startsOn: "asc" }, { createdAt: "asc" }],
      },
      leaves: {
        where: { startsOn: { lte: through } },
        orderBy: [{ startsOn: "asc" }],
      },
      shiftDayOverrides: { where: { date: { in: dates } } },
    },
  }) as Promise<AssignmentSource[]>;
}

export async function createShiftSwapRequest(data: {
  recipientId: string;
  requesterDate: string;
  recipientDate: string;
  note?: string;
}) {
  const session = await auth();
  const requesterId = session?.user?.id;
  if (!requesterId) return { success: false, error: "Sign in to request a shift swap" };

  const parsed = createSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid swap request" };
  if (parsed.data.recipientId === requesterId) return { success: false, error: "Choose another user" };
  const today = new Date().toISOString().slice(0, 10);
  if (parsed.data.requesterDate < today || parsed.data.recipientDate < today) {
    return { success: false, error: "Swap dates must be today or in the future" };
  }
  const requesterDate = toDate(parsed.data.requesterDate);
  const recipientDate = toDate(parsed.data.recipientDate);

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const users = await loadAssignments(transaction, [requesterId, parsed.data.recipientId], [requesterDate, recipientDate]);
      const requester = users.find((user) => user.id === requesterId);
      const recipient = users.find((user) => user.id === parsed.data.recipientId);
      if (!requester || !recipient) return { success: false as const, error: "Both employees must be active to request a swap" };

      const requesterAssignment = assignmentFor(requester, requesterDate);
      const recipientAssignment = assignmentFor(recipient, recipientDate);
      if (requesterAssignment.status === ShiftDayStatus.LEAVE && recipientAssignment.status === ShiftDayStatus.LEAVE) {
        return { success: false as const, error: "Both selected dates are leave, so there is no working shift to swap" };
      }
      if (requesterAssignment.status === recipientAssignment.status && requesterAssignment.shift === recipientAssignment.shift) {
        const assignmentLabel = requesterAssignment.status === ShiftDayStatus.LEAVE
          ? "Leave"
          : requesterAssignment.shift === "NINE_TO_SIX" ? "Morning" : "Night";
        return { success: false as const, error: `Both selected dates have the same assignment (${assignmentLabel}). Choose different shifts or one leave day.` };
      }

      const pending = await transaction.shiftSwapRequest.findFirst({
        where: {
          status: { in: [ShiftSwapStatus.WAITING_FOR_USER, ShiftSwapStatus.WAITING_FOR_ADMIN] },
          OR: [
            { requesterId, requesterDate },
            { recipientId: requesterId, recipientDate: requesterDate },
            { requesterId: recipient.id, requesterDate: recipientDate },
            { recipientId: recipient.id, recipientDate },
          ],
        },
        select: { id: true },
      });
      if (pending) return { success: false as const, error: "One of these employee dates is already part of a pending swap" };

      await transaction.shiftSwapRequest.create({
        data: {
          requesterId,
          recipientId: recipient.id,
          requesterDate,
          recipientDate,
          note: parsed.data.note || null,
        },
      });
      return { success: true as const, error: null };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (!result.success) return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return { success: false, error: "Availability changed while checking. Refresh the schedule and try again." };
    }
    throw error;
  }

  revalidatePath("/admin/schedule");
  return { success: true, error: null };
}

export async function respondToShiftSwap(id: string, accept: boolean) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Sign in to respond to this request" };
  const parsedId = z.string().min(1).safeParse(id);
  if (!parsedId.success) return { success: false, error: "Invalid swap request" };

  const result = await prisma.shiftSwapRequest.updateMany({
    where: { id: parsedId.data, recipientId: userId, status: ShiftSwapStatus.WAITING_FOR_USER },
    data: { status: accept ? ShiftSwapStatus.WAITING_FOR_ADMIN : ShiftSwapStatus.DECLINED },
  });
  if (!result.count) return { success: false, error: "This request is no longer waiting for your response" };

  revalidatePath("/admin/schedule");
  return { success: true, error: null };
}

type AssignmentSource = {
  id: string;
  defaultShift: "NINE_TO_SIX" | "TWO_TO_ELEVEN";
  shiftSchedules: { shift: "NINE_TO_SIX" | "TWO_TO_ELEVEN"; startsOn: Date; endsOn: Date | null; repeat: "ONCE" | "DAILY" | "WEEKLY"; weekdays: number[]; createdAt: Date }[];
  leaves: { startsOn: Date; endsOn: Date | null; repeat: "ONCE" | "DAILY" | "WEEKLY"; weekdays: number[] }[];
  shiftDayOverrides: { date: Date; status: ShiftDayStatus; shift: "NINE_TO_SIX" | "TWO_TO_ELEVEN" | null }[];
};

function assignmentFor(user: AssignmentSource, date: Date) {
  const key = dateKey(date);
  const override = user.shiftDayOverrides.find((item) => dateKey(item.date) === key);
  if (override) return { status: override.status, shift: override.shift };

  const leave = user.leaves.some((item) => {
    const start = dateKey(item.startsOn);
    const end = item.endsOn ? dateKey(item.endsOn) : null;
    if (start > key || (end && end < key)) return false;
    if (item.repeat === "ONCE") return true;
    if (item.repeat === "DAILY") return true;
    return item.weekdays.includes(date.getUTCDay());
  });
  if (leave) return { status: ShiftDayStatus.LEAVE, shift: null };

  const rule = user.shiftSchedules
    .filter((item) => {
      const start = dateKey(item.startsOn);
      const end = item.endsOn ? dateKey(item.endsOn) : null;
      if (start > key || (end && end < key)) return false;
      if (item.repeat === "ONCE") return start === key;
      if (item.repeat === "DAILY") return true;
      return item.weekdays.includes(date.getUTCDay());
    })
    .sort((a, b) => a.startsOn.getTime() - b.startsOn.getTime() || a.createdAt.getTime() - b.createdAt.getTime())
    .at(-1);
  return { status: ShiftDayStatus.WORK, shift: rule?.shift ?? user.defaultShift };
}

export async function reviewShiftSwap(id: string, approve: boolean) {
  await requirePermission("shifts", "manage");
  const parsedId = z.string().min(1).safeParse(id);
  if (!parsedId.success) return { success: false, error: "Invalid swap request" };

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const request = await transaction.shiftSwapRequest.findUnique({ where: { id: parsedId.data } });
      if (!request || request.status !== ShiftSwapStatus.WAITING_FOR_ADMIN) {
        return { success: false as const, error: "This request is no longer waiting for approval" };
      }
      if (!approve) {
        await transaction.shiftSwapRequest.update({ where: { id: request.id }, data: { status: ShiftSwapStatus.REJECTED } });
        return { success: true as const, error: null };
      }

      const requestDate = request.requesterDate;
      const recipientDate = request.recipientDate;
      const users = await loadAssignments(transaction, [request.requesterId, request.recipientId], [requestDate, recipientDate]);
      const requester = users.find((user) => user.id === request.requesterId);
      const recipient = users.find((user) => user.id === request.recipientId);
      if (!requester || !recipient) return { success: false as const, error: "Both users must be active to approve this swap" };

      const requesterDay = assignmentFor(requester, requestDate);
      const recipientDay = assignmentFor(recipient, recipientDate);
      if (requesterDay.status === ShiftDayStatus.LEAVE && recipientDay.status === ShiftDayStatus.LEAVE) {
        return { success: false as const, error: "Both dates are now leave. This swap cannot be approved." };
      }
      if (requesterDay.status === recipientDay.status && requesterDay.shift === recipientDay.shift) {
        return { success: false as const, error: "The assignments are now the same. This swap no longer changes either schedule." };
      }
      await transaction.shiftDayOverride.createMany({
        data: [
          { userId: requester.id, date: requestDate, status: recipientDay.status, shift: recipientDay.shift, requestId: request.id },
          { userId: recipient.id, date: recipientDate, status: requesterDay.status, shift: requesterDay.shift, requestId: request.id },
        ],
      });
      await transaction.shiftSwapRequest.update({ where: { id: request.id }, data: { status: ShiftSwapStatus.APPROVED } });
      return { success: true as const, error: null };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (!result.success) return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2002" || error.code === "P2034")) {
      return { success: false, error: "One of these dates changed during another swap. Refresh and review the request again." };
    }
    throw error;
  }

  revalidatePath("/admin/schedule");
  return { success: true, error: null };
}
