# Noor Bike Rentals

## Supabase setup

1. Create a Supabase project and copy its Project URL and publishable (anon) key
   into `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see
   `.env.example`). Do not put a service-role key in this client application.
2. Apply `supabase/migrations/20261008000000_create_rental_tables.sql` in the
   Supabase SQL Editor. It creates the app tables, authenticated-user RLS
   policies, private rental-media storage, and realtime publication membership.
3. Create an account for each authorized staff member in Supabase
   Authentication, then authorize each email in the SQL Editor:

   ```sql
   insert into public.authorized_staff_users (user_id, email)
   select id, email
   from auth.users
   where lower(email) = lower('staff@example.com');
   ```

   The app has no public sign-up. RLS also blocks authenticated accounts that
   are not in this user-ID allowlist. Authorized staff share one business
   workspace.
4. Install dependencies and run the app:

   ```sh
   npm install
   npm run dev
   ```

On first setup, the first authorized session migrates existing
`noor_kandy_clean_start_v5_*` local records, if present; otherwise it seeds the
fleet, tours catalogue, and business profile from the included defaults.
Bookings and finance records are created by the app. All operational data is
read from and written to Supabase;
realtime changes are synchronized across signed-in clients. Customer identity
documents and signatures are kept in the private `rental-media` bucket, and
the database contains only their storage paths.

The optional `scripts/clearBookings.js` utility also uses Supabase. To run it,
add `SUPABASE_STAFF_EMAIL` and `SUPABASE_STAFF_PASSWORD` to `.env.local`, then
run `node scripts/clearBookings.js --confirm`. The confirmation flag is
required because the utility deletes all bookings and finance records.
