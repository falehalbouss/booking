-- Enforce strict RLS on public.bookings:
--   * admins can SELECT all rows
--   * anyone (anon or authenticated) can INSERT a new row
--   * everything else is blocked

alter table public.bookings enable row level security;

drop policy if exists "Users read own bookings"        on public.bookings;
drop policy if exists "Users insert own bookings"      on public.bookings;
drop policy if exists "Admins can read all bookings"   on public.bookings;
drop policy if exists "Admins can update all bookings" on public.bookings;
drop policy if exists "Admins can delete all bookings" on public.bookings;
drop policy if exists "Anyone can create bookings"     on public.bookings;

create policy "Admins can read all bookings"
  on public.bookings for select
  to authenticated
  using (public.is_admin());

create policy "Anyone can create bookings"
  on public.bookings for insert
  to anon, authenticated
  with check (true);
