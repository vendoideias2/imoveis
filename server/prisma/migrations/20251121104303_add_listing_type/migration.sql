-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT', 'BOTH');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "listingType" "ListingType" NOT NULL DEFAULT 'SALE';
