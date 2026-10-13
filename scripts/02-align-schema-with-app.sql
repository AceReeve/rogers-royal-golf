-- Align older Supabase schemas with the current app code.
-- Run this once against an existing database after 01-create-schema.sql.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tour_dates'
      AND column_name = 'available_seats'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tour_dates'
      AND column_name = 'available_slots'
  ) THEN
    EXECUTE 'ALTER TABLE public.tour_dates RENAME COLUMN available_seats TO available_slots';
  END IF;
END $$;

ALTER TABLE public.orders
  ALTER COLUMN order_number SET DEFAULT ('ORD-' || upper(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 12)));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'order_items'
      AND column_name = 'unit_price'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'order_items'
      AND column_name = 'price'
  ) THEN
    EXECUTE 'ALTER TABLE public.order_items RENAME COLUMN unit_price TO price';
  END IF;
END $$;

ALTER TABLE public.tour_bookings
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS number_of_participants INTEGER,
  ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tour_bookings'
      AND column_name = 'num_participants'
  ) THEN
    EXECUTE '
      UPDATE public.tour_bookings
      SET number_of_participants = COALESCE(number_of_participants, num_participants)
      WHERE num_participants IS NOT NULL
    ';
  END IF;
END $$;

UPDATE public.tour_bookings tb
SET
  user_id = o.user_id,
  updated_at = COALESCE(tb.updated_at, CURRENT_TIMESTAMP)
FROM public.orders o
WHERE tb.order_id = o.id
  AND tb.user_id IS NULL;

UPDATE public.tour_bookings tb
SET
  tour_id = td.tour_id,
  number_of_participants = COALESCE(tb.number_of_participants, 1),
  status = COALESCE(tb.status, 'pending'),
  updated_at = COALESCE(tb.updated_at, CURRENT_TIMESTAMP)
FROM public.tour_dates td
WHERE tb.tour_date_id = td.id;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tour_bookings'
      AND column_name = 'price_per_person'
  ) THEN
    EXECUTE '
      UPDATE public.tour_bookings
      SET total_price = COALESCE(total_price, (COALESCE(price_per_person, 0) * COALESCE(number_of_participants, 1)))
      WHERE total_price IS NULL
    ';
  END IF;
END $$;

ALTER TABLE public.tour_bookings
  ALTER COLUMN order_id DROP NOT NULL;

ALTER TABLE public.payments
  ALTER COLUMN order_id DROP NOT NULL;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB;

UPDATE public.payments p
SET
  user_id = COALESCE(p.user_id, o.user_id),
  external_id = COALESCE(p.external_id, p.transaction_id),
  metadata = COALESCE(p.metadata, '{}'::jsonb)
FROM public.orders o
WHERE o.id = p.order_id;

CREATE INDEX IF NOT EXISTS idx_tour_bookings_user_id ON public.tour_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON public.payments(external_id);

DROP POLICY IF EXISTS "Users can view own tour bookings" ON public.tour_bookings;
CREATE POLICY "Users can view own tour bookings" ON public.tour_bookings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);
