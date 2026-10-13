-- Allow deleting catalog products that appear on past orders.
-- Order history keeps product_name + price; product_id is cleared (SET NULL).

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name TEXT;

UPDATE order_items oi
SET product_name = p.name
FROM products p
WHERE oi.product_id = p.id
  AND (oi.product_name IS NULL OR btrim(oi.product_name) = '');

ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE order_items
  ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

COMMENT ON COLUMN order_items.product_name IS 'Snapshot at checkout; shown when product is removed from catalog.';
