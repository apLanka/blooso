-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "business_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT NOT NULL,
    "phone" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "business_applications_userId_idx" ON "business_applications"("userId");

-- CreateIndex
CREATE INDEX "business_applications_status_idx" ON "business_applications"("status");

-- AddForeignKey
ALTER TABLE "business_applications" ADD CONSTRAINT "business_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
