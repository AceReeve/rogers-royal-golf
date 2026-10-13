-- Optional: normalize legacy order statuses to fulfillment flow (run once in Supabase SQL Editor).
UPDATE orders SET status = 'preparing' WHERE status IN ('confirmed', 'completed', 'pending');
UPDATE orders SET status = 'out_for_delivery'
WHERE lower(replace(replace(trim(status), ' ', '_'), '-', '_')) IN (
  'out_of_delivery',
  'out_for_deliver',
  'out_of_deliver'
);
-- Leave cancelled / failed / refunded as-is.

COMMENT ON COLUMN orders.status IS 'Fulfillment: preparing, out_for_delivery, delivered';
