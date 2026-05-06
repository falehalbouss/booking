-- Adds admin support: is_admin flag on profiles + RLS policies that let admins
-- read/update/delete every booking and read every profile.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

grant execute on function public.is_admin() to authenticated, anon;

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read all bookings" on public.bookings;
create policy "Admins can read all bookings"
  on public.bookings for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update all bookings" on public.bookings;
create policy "Admins can update all bookings"
  on public.bookings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete all bookings" on public.bookings;
create policy "Admins can delete all bookings"
  on public.bookings for delete
  to authenticated
  using (public.is_admin());
