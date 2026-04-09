-- CreateTable
CREATE TABLE "UserStreak" (
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalActiveDays" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "UserStreak_userId_idx" ON "UserStreak"("userId");

-- CreateIndex
CREATE INDEX "UserStreak_lastActiveDate_idx" ON "UserStreak"("lastActiveDate");

-- AddForeignKey
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
