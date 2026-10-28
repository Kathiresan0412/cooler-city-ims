CREATE TABLE "login_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "successful" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "login_history_createdAt_idx" ON "login_history"("createdAt");
CREATE INDEX "login_history_userId_createdAt_idx" ON "login_history"("userId", "createdAt");

ALTER TABLE "login_history"
ADD CONSTRAINT "login_history_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
