WITH ranked_tokens AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "createdAt" DESC, "id" DESC
    ) AS position
  FROM "PasswordResetToken"
  WHERE "usedAt" IS NULL
)
UPDATE "PasswordResetToken"
SET "usedAt" = CURRENT_TIMESTAMP
WHERE "id" IN (
  SELECT "id" FROM ranked_tokens WHERE position > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_one_active_per_user"
ON "PasswordResetToken" ("userId")
WHERE "usedAt" IS NULL;
