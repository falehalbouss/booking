-- Add MyFatoorah payment tracking to bookings.
alter table public.bookings
  add column if not exists nights         integer        not null default 1,
  add column if not exists total_kwd      numeric(10, 3) not null default 0,
  add column if not exists payment_status text           not null default 'pending',
  add column if not exists payment_id     text;

create index if not exists bookings_payment_id_idx on public.bookings(payment_id);

-- Allow the booking owner to update their own row's payment_status/payment_id
-- after the MyFatoorah callback. Other rows are still protected by the
-- existing read/insert policies.
drop policy if exists "Users update own booking payment" on public.bookings;
create policy "Users update own booking payment"
  on public.bookings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
