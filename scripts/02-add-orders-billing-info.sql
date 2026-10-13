-- Optional: add a dedicated JSONB column for billing (for SQL reporting). The app stores checkout
-- billing in `orders.notes` as JSON with key `unoCheckoutBilling` so it works without this column.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_info JSONB;

COMMENT ON COLUMN orders.billing_info IS 'Optional duplicate of checkout billing; app primary store is notes.unoCheckoutBilling until backfilled.';
