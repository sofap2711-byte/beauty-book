-- Drop Booking table (depends on Slot)
DROP TABLE IF EXISTS "Booking";

-- Drop Slot table
DROP TABLE IF EXISTS "Slot";

-- Create TimeBlock table
CREATE TABLE "TimeBlock" (
    "id" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "clientName" TEXT,
    "clientPhone" TEXT,
    "clientTg" TEXT,
    "serviceName" TEXT,
    "comment" TEXT,
    "adminNotes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeBlock_pkey" PRIMARY KEY ("id")
);

-- Create index on masterId + date
CREATE INDEX "TimeBlock_masterId_date_idx" ON "TimeBlock"("masterId", "date");

-- Add foreign key to Master
ALTER TABLE "TimeBlock" ADD CONSTRAINT "TimeBlock_masterId_fkey" 
    FOREIGN KEY ("masterId") REFERENCES "Master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
