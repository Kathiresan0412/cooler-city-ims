CREATE TYPE "WorkShift" AS ENUM ('NINE_TO_SIX', 'TWO_TO_ELEVEN');
CREATE TYPE "ShiftRepeat" AS ENUM ('ONCE', 'DAILY', 'WEEKLY');

ALTER TABLE "users"
ADD COLUMN "defaultShift" "WorkShift" NOT NULL DEFAULT 'NINE_TO_SIX';

CREATE TABLE "shift_schedule_rules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shift" "WorkShift" NOT NULL,
    "startsOn" DATE NOT NULL,
    "endsOn" DATE,
    "repeat" "ShiftRepeat" NOT NULL DEFAULT 'ONCE',
    "weekdays" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shift_schedule_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_leaves" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startsOn" DATE NOT NULL,
    "endsOn" DATE NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_leaves_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "shift_schedule_rules_userId_startsOn_idx" ON "shift_schedule_rules"("userId", "startsOn");
CREATE INDEX "user_leaves_userId_startsOn_endsOn_idx" ON "user_leaves"("userId", "startsOn", "endsOn");

ALTER TABLE "shift_schedule_rules"
ADD CONSTRAINT "shift_schedule_rules_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_leaves"
ADD CONSTRAINT "user_leaves_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
