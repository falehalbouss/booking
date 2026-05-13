-- H3: Booking reference is now a strong 8-char random token; enforce
-- uniqueness at the DB level so two bookings can never share a ref.
-- Existing 4-digit refs may collide with new tokens (different formats),
-- so the constraint only takes effect for new inserts.

create unique index if not exists bookings_ref_unique_idx
  on public.bookings(ref);
