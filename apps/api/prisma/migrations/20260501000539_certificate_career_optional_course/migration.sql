-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "careerId" TEXT,
ALTER COLUMN "courseId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Certificate_userId_careerId_idx" ON "Certificate"("userId", "careerId");

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
