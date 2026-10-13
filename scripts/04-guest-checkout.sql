-- Allow guest checkout: orders and payments may exist without a linked auth user.
-- Billing email is stored in orders.notes (unoCheckoutBilling) for guest orders.

ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL;

COMMENT ON COLUMN orders.user_id IS 'Null for guest checkout; billing contact in notes.unoCheckoutBilling.';
COMMENT ON COLUMN payments.user_id IS 'Null for guest checkout; guest email in metadata.billingInfo.';
