"use server";

import { Prisma, ShiftRepeat, WorkShift } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Enter a valid date");

const scheduleSchema = z
  .object({
    userId: z.string().min(1, "Select a user"),
    shift: z.nativeEnum(WorkShift),
    startsOn: dateOnlySchema,
    endsOn: z.preprocess(
      (value) => (value === "" ? undefined : value),
      dateOnlySchema.optional()
    ),
    repeat: z.nativeEnum(ShiftRepeat),
    weekdays: z.array(z.number().int().min(0).max(6)).max(7),
  })
  .superRefine((data, context) => {
    if (data.endsOn && data.endsOn < data.startsOn) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["endsOn"], message: "End date must be on or after the start date" });
    }
    if (data.repeat === "WEEKLY" && data.weekdays.length === 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["weekdays"], message: "Select at least one day" });
    }
    if (data.repeat !== "WEEKLY" && data.weekdays.length > 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["weekdays"], message: "Days can only be selected for weekly repeats" });
    }
  });

const leaveSchema = z
  .object({
    userId: z.string().min(1, "Select a user"),
    startsOn: dateOnlySchema,
    endsOn: z.preprocess(
      (value) => (value === "" ? undefined : value),
      dateOnlySchema.optional()
    ),
    repeat: z.nativeEnum(ShiftRepeat),
    weekdays: z.array(z.number().int().min(0).max(6)).max(7),
    reason: z.string().trim().max(250, "Reason must be 250 characters or fewer").optional(),
  })
  .superRefine((data, context) => {
    if (data.endsOn && data.endsOn < data.startsOn) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["endsOn"], message: "End date must be on or after the start date" });
    }
    if (data.repeat === "ONCE" && !data.endsOn) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["endsOn"], message: "Last day is required for one-time leave" });
    }
    if (data.repeat === "WEEKLY" && data.weekdays.length === 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["weekdays"], message: "Select at least one leave day" });
    }
    if (data.repeat !== "WEEKLY" && data.weekdays.length > 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["weekdays"], message: "Select weekdays only for weekly leave" });
    }
  });

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function createShiftSchedule(data: {
  userId: string;
  shift: WorkShift;
  startsOn: string;
  endsOn?: string;
  repeat: ShiftRepeat;
  weekdays: number[];
}) {
  await requirePermission("shifts", "manage");
  const parsed = scheduleSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid shift schedule" };
  }

  const user = await prisma.user.findFirst({
    where: { id: parsed.data.userId, isActive: true },
    select: { id: true },
  });
  if (!user) return { success: false, error: "Selected active user was not found" };

  await prisma.shiftScheduleRule.create({
    data: {
      userId: user.id,
      shift: parsed.data.shift,
      startsOn: toDate(parsed.data.startsOn),
      endsOn: parsed.data.repeat === "ONCE"
        ? toDate(parsed.data.startsOn)
        : parsed.data.endsOn
          ? toDate(parsed.data.endsOn)
          : null,
      repeat: parsed.data.repeat,
      weekdays: parsed.data.repeat === "WEEKLY" ? parsed.data.weekdays : [],
    },
  });

  revalidatePath("/admin/schedule");
  revalidatePath("/admin/users");
  return { success: true, error: null };
}

export async function deleteShiftSchedule(id: string) {
  await requirePermission("shifts", "manage");
  const parsedId = z.string().min(1).safeParse(id);
  if (!parsedId.success) return { success: false, error: "Invalid schedule" };

  try {
    await prisma.shiftScheduleRule.delete({ where: { id: parsedId.data } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: "Shift schedule not found" };
    }
    throw error;
  }

  revalidatePath("/admin/schedule");
  return { success: true, error: null };
}

export async function createUserLeave(data: {
  userId: string;
  startsOn: string;
  endsOn?: string;
  repeat: ShiftRepeat;
  weekdays: number[];
  reason?: string;
}) {
  await requirePermission("shifts", "manage");
  const parsed = leaveSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid leave dates" };
  }

  const user = await prisma.user.findFirst({
    where: { id: parsed.data.userId, isActive: true },
    select: { id: true },
  });
  if (!user) return { success: false, error: "Selected active user was not found" };

  const startsOn = toDate(parsed.data.startsOn);
  const endsOn = parsed.data.endsOn ? toDate(parsed.data.endsOn) : null;
  let created: boolean;
  try {
    created = await prisma.$transaction(async (transaction) => {
      const overlappingLeave = parsed.data.repeat === "ONCE" && endsOn
        ? await transaction.userLeave.findFirst({
            where: {
              userId: user.id,
              repeat: "ONCE",
              startsOn: { lte: endsOn },
              OR: [{ endsOn: null }, { endsOn: { gte: startsOn } }],
            },
            select: { id: true },
          })
        : null;
      if (overlappingLeave) {
        return false;
      }

      await transaction.userLeave.create({
        data: {
          userId: user.id,
          startsOn,
          endsOn,
          repeat: parsed.data.repeat,
          weekdays: parsed.data.repeat === "WEEKLY" ? parsed.data.weekdays : [],
          reason: parsed.data.reason || null,
        },
      });
      return true;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return { success: false, error: "Leave changed while saving. Please try again." };
    }
    throw error;
  }
  if (!created) return { success: false, error: "This leave period overlaps an existing leave for this user" };

  revalidatePath("/admin/schedule");
  return { success: true, error: null };
}

export async function deleteUserLeave(id: string) {
  await requirePermission("shifts", "manage");
  const parsedId = z.string().min(1).safeParse(id);
  if (!parsedId.success) return { success: false, error: "Invalid leave record" };

  try {
    await prisma.userLeave.delete({ where: { id: parsedId.data } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: "Leave record not found" };
    }
    throw error;
  }

  revalidatePath("/admin/schedule");
  return { success: true, error: null };
}
