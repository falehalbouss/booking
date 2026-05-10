-- Restore a working set of policies on public.bookings so the whole app
-- functions: users can read/create their own bookings, admins can do
-- everything. Replaces the very strict admin-SELECT-only policy.

alter table public.bookings enable row level security;

drop policy if exists "Users read own bookings"        on public.bookings;
drop policy if exists "Users insert own bookings"      on public.bookings;
drop policy if exists "Admins can read all bookings"   on public.bookings;
drop policy if exists "Admins can update all bookings" on public.bookings;
drop policy if exists "Admins can delete all bookings" on public.bookings;
drop policy if exists "Anyone can create bookings"     on public.bookings;

create policy "Users read own bookings"
  on public.bookings for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own bookings"
  on public.bookings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Admins can read all bookings"
  on public.bookings for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update all bookings"
  on public.bookings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete all bookings"
  on public.bookings for delete
  to authenticated
  using (public.is_admin());
