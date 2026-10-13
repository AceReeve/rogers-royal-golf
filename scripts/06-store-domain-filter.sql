-- Shared-database multi-store filter.
-- Run once on the shared Supabase project. Each storefront then lists only its own rows
-- based on Host / NEXT_PUBLIC_STORE_ID.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'products'
  ) THEN
    ALTER TABLE products ADD COLUMN IF NOT EXISTS store TEXT;
    UPDATE products SET store = 'unotourph' WHERE store IS NULL OR btrim(store) = '';
    CREATE INDEX IF NOT EXISTS products_store_idx ON products (store);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'tours'
  ) THEN
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS store TEXT;
    UPDATE tours SET store = 'unotourph' WHERE store IS NULL OR btrim(store) = '';
    CREATE INDEX IF NOT EXISTS tours_store_idx ON tours (store);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS store TEXT;
    UPDATE orders SET store = 'unotourph' WHERE store IS NULL OR btrim(store) = '';
    CREATE INDEX IF NOT EXISTS orders_store_idx ON orders (store);
  END IF;
END $$;

-- Store ids used by the apps:
-- unotourph, unoluxuryph, unogadget, hiphils, unokbeautyph, philss, rogers-royal-golf
--
-- Reassign existing catalog rows when needed, for example:
-- UPDATE products SET store = 'philss' WHERE id IN (...);
-- UPDATE products SET store = 'rogers-royal-golf' WHERE id IN (...);
