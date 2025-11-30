-- Migration: Add secondary email and password reset
-- Created: 2025-11-30

-- Alter User table to add new fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "secondaryEmail" varchar(255),
ADD COLUMN IF NOT EXISTS "secondaryEmailVerified" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "passwordResetToken" varchar(500),
ADD COLUMN IF NOT EXISTS "passwordResetExpires" timestamp,
ADD COLUMN IF NOT EXISTS "lastPasswordChangeAt" timestamp;

-- Create index for password reset token lookups
CREATE INDEX IF NOT EXISTS "User_passwordResetToken_idx" ON "User"("passwordResetToken");

-- Add secondary email to User constraints
ALTER TABLE "User" ADD CONSTRAINT "unique_secondary_email" UNIQUE("secondaryEmail");

-- Migration complete
