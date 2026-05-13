-- DropBreakColumns
ALTER TABLE "Master" DROP COLUMN IF EXISTS "breakStart";
ALTER TABLE "Master" DROP COLUMN IF EXISTS "breakEnd";

-- AddIntervalToSlot
ALTER TABLE "Slot" ADD COLUMN "interval" INTEGER NOT NULL DEFAULT 30;
