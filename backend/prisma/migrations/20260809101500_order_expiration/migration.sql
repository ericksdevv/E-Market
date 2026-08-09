ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Order_status_expiresAt_idx"
ON "Order" ("status", "expiresAt");
