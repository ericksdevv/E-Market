-- Phone numbers are normalized to digits before this migration is applied.
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
