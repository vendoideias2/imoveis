-- AlterTable
ALTER TABLE "User" ADD COLUMN     "commissionRate" DECIMAL(5,2),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active';
