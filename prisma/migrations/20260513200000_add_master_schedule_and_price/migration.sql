-- Add price column to TimeBlock
ALTER TABLE "TimeBlock" ADD COLUMN "price" INTEGER;

-- Create MasterSchedule table
CREATE TABLE "MasterSchedule" (
    "id" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "isWorkDay" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MasterSchedule_pkey" PRIMARY KEY ("id")
);

-- Create unique index on masterId + date
CREATE UNIQUE INDEX "MasterSchedule_masterId_date_key" ON "MasterSchedule"("masterId", "date");

-- Create index on masterId + date
CREATE INDEX "MasterSchedule_masterId_date_idx" ON "MasterSchedule"("masterId", "date");

-- Add foreign key to Master
ALTER TABLE "MasterSchedule" ADD CONSTRAINT "MasterSchedule_masterId_fkey" 
    FOREIGN KEY ("masterId") REFERENCES "Master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
