-- Add public.bookings to the supabase_realtime publication so the
-- admin dashboard can subscribe to live INSERT/UPDATE/DELETE events.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;
end
$$;

-- Make sure UPDATE/DELETE events expose the full old row so the
-- client can match them by primary key without an extra fetch.
alter table public.bookings replica identity full;
