ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "sessionVersion" INTEGER NOT NULL DEFAULT 0;

WITH ranked_carts AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "updatedAt" DESC, "id" DESC
    ) AS position
  FROM "Cart"
  WHERE "status" = 'ACTIVE'
)
UPDATE "Cart"
SET "status" = 'ABANDONED'
WHERE "id" IN (
  SELECT "id" FROM ranked_carts WHERE position > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS "Cart_one_active_per_user"
ON "Cart" ("userId")
WHERE "status" = 'ACTIVE';

WITH ranked_addresses AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "updatedAt" DESC, "id" DESC
    ) AS position
  FROM "Address"
  WHERE "isDefault" = TRUE
)
UPDATE "Address"
SET "isDefault" = FALSE
WHERE "id" IN (
  SELECT "id" FROM ranked_addresses WHERE position > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS "Address_one_default_per_user"
ON "Address" ("userId")
WHERE "isDefault" = TRUE;
