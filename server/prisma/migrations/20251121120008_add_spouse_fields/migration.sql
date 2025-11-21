-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "spouseDoc" TEXT,
ADD COLUMN     "spouseEmail" TEXT,
ADD COLUMN     "spouseName" TEXT,
ADD COLUMN     "spousePhone" TEXT,
ADD COLUMN     "spouseProfession" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "spouseDoc" TEXT,
ADD COLUMN     "spouseEmail" TEXT,
ADD COLUMN     "spouseName" TEXT,
ADD COLUMN     "spousePhone" TEXT,
ADD COLUMN     "spouseProfession" TEXT;
