-- CodeCrafix: admin access for the website bookings system (run 2026-11-25 via Supabase SQL Editor)
-- Lets admin accounts (public.is_admin(), email in admin_users) manage bookings and view all user profiles
-- in the admin panel. Verified by JWT-claims simulation: admin sees all rows, normal users see only their own.
grant select, update, delete on public.bookings to authenticated;
grant select on public.profiles to authenticated;

drop policy if exists "admins read bookings" on public.bookings;
create policy "admins read bookings" on public.bookings
  for select to authenticated using (public.is_admin());

drop policy if exists "admins update bookings" on public.bookings;
create policy "admins update bookings" on public.bookings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete bookings" on public.bookings;
create policy "admins delete bookings" on public.bookings
  for delete to authenticated using (public.is_admin());

drop policy if exists "admins read profiles" on public.profiles;
create policy "admins read profiles" on public.profiles
  for select to authenticated using (public.is_admin());
