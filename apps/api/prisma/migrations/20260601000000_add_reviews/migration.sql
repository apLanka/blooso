-- AlterTable
ALTER TABLE "businesses" ADD COLUMN "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "businesses" ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "clientId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "businessReply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_appointmentId_key" ON "reviews"("appointmentId");

-- CreateIndex
CREATE INDEX "reviews_businessId_idx" ON "reviews"("businessId");

-- CreateIndex
CREATE INDEX "reviews_appointmentId_idx" ON "reviews"("appointmentId");

-- AddCheckConstraint for rating 1-5
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5);

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
