-- C5: Drop the user-side UPDATE policy on bookings.
--
-- The "Users update own booking payment" policy let any authenticated
-- user update ANY column of bookings they owned (including
-- payment_status, status, total_kwd, room_id, etc.) — there was no
-- column-level restriction. Combined with the old client-side
-- applyPaymentResult call this enabled a complete payment bypass.
--
-- Payment writes now happen exclusively in the MyFatoorah callback
-- route using the service role key (which bypasses RLS), after the
-- server has verified status.customerReference + status.invoiceValue
-- against the booking. There is no longer any legitimate reason for
-- a user-session UPDATE on bookings; drop the policy entirely. The
-- "Admins can update all bookings" policy is unaffected.

drop policy if exists "Users update own booking payment" on public.bookings;
