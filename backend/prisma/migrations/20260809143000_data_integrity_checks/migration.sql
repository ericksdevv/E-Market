ALTER TABLE "Product"
ADD CONSTRAINT "Product_stock_nonnegative" CHECK ("stock" >= 0),
ADD CONSTRAINT "Product_price_nonnegative" CHECK ("price" >= 0),
ADD CONSTRAINT "Product_promotional_price_valid" CHECK (
  "promotionalPrice" IS NULL OR
  ("promotionalPrice" >= 0 AND "promotionalPrice" < "price")
);

ALTER TABLE "CartItem"
ADD CONSTRAINT "CartItem_quantity_positive" CHECK ("quantity" > 0),
ADD CONSTRAINT "CartItem_unit_price_nonnegative" CHECK ("unitPrice" >= 0);

ALTER TABLE "Order"
ADD CONSTRAINT "Order_amounts_nonnegative" CHECK (
  "subtotal" >= 0 AND
  "shippingFee" >= 0 AND
  "discount" >= 0 AND
  "total" >= 0
),
ADD CONSTRAINT "Order_total_consistent" CHECK (
  "total" = "subtotal" + "shippingFee" - "discount"
);

ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_quantity_positive" CHECK ("quantity" > 0),
ADD CONSTRAINT "OrderItem_amounts_consistent" CHECK (
  "unitPrice" >= 0 AND
  "subtotal" = "unitPrice" * "quantity"
);

ALTER TABLE "Payment"
ADD CONSTRAINT "Payment_amount_nonnegative" CHECK ("amount" >= 0);

ALTER TABLE "Coupon"
ADD CONSTRAINT "Coupon_value_positive" CHECK ("value" > 0),
ADD CONSTRAINT "Coupon_usage_valid" CHECK (
  "usedCount" >= 0 AND
  ("maxUsage" IS NULL OR ("maxUsage" >= 0 AND "usedCount" <= "maxUsage"))
);

ALTER TABLE "StockMovement"
ADD CONSTRAINT "StockMovement_quantity_positive" CHECK ("quantity" > 0);
