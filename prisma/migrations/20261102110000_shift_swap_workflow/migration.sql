CREATE TYPE "ShiftSwapStatus" AS ENUM (
  'WAITING_FOR_USER',
  'WAITING_FOR_ADMIN',
  'APPROVED',
  'DECLINED',
  'REJECTED'
);

CREATE TYPE "ShiftDayStatus" AS ENUM ('WORK', 'LEAVE');

CREATE TABLE "shift_swap_requests" (
  "id" TEXT NOT NULL,
  "requesterId" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "requesterDate" DATE NOT NULL,
  "recipientDate" DATE NOT NULL,
  "note" TEXT,
  "status" "ShiftSwapStatus" NOT NULL DEFAULT 'WAITING_FOR_USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "shift_swap_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shift_day_overrides" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "status" "ShiftDayStatus" NOT NULL,
  "shift" "WorkShift",
  "requestId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "shift_day_overrides_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "shift_swap_requests_requesterId_status_idx"
  ON "shift_swap_requests"("requesterId", "status");
CREATE INDEX "shift_swap_requests_recipientId_status_idx"
  ON "shift_swap_requests"("recipientId", "status");
CREATE UNIQUE INDEX "shift_day_overrides_userId_date_key"
  ON "shift_day_overrides"("userId", "date");
CREATE INDEX "shift_day_overrides_date_idx" ON "shift_day_overrides"("date");

ALTER TABLE "shift_swap_requests"
  ADD CONSTRAINT "shift_swap_requests_requesterId_fkey"
  FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "shift_swap_requests_recipientId_fkey"
  FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shift_day_overrides"
  ADD CONSTRAINT "shift_day_overrides_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "shift_day_overrides_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "shift_swap_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
