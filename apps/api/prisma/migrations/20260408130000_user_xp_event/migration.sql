-- CreateTable
CREATE TABLE "UserXpEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reasonId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserXpEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserXpEvent_userId_createdAt_idx" ON "UserXpEvent"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserXpEvent_userId_reasonId_key" ON "UserXpEvent"("userId", "reasonId");

-- AddForeignKey
ALTER TABLE "UserXpEvent" ADD CONSTRAINT "UserXpEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

