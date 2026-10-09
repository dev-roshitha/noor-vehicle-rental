import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

if (!process.argv.includes('--confirm')) {
  throw new Error('This deletes all bookings and finance records. Re-run with --confirm to proceed.');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const staffEmail = process.env.SUPABASE_STAFF_EMAIL;
const staffPassword = process.env.SUPABASE_STAFF_PASSWORD;

if (!supabaseUrl || !supabaseKey || !staffEmail || !staffPassword) {
  throw new Error(
    'Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_STAFF_EMAIL, and SUPABASE_STAFF_PASSWORD in .env.local.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAll() {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: staffEmail,
    password: staffPassword,
  });
  if (signInError) throw signInError;

  const { data: isAuthorized, error: authorizationError } = await supabase.rpc('is_authorized_staff');
  if (authorizationError) throw authorizationError;
  if (!isAuthorized) throw new Error('This account is not authorized to manage rental data.');

  const { error: bookingsError } = await supabase.from('bookings').delete().neq('id', '');
  if (bookingsError) throw bookingsError;
  console.log('Deleted all bookings.');

  const { error: financesError } = await supabase.from('daily_finances').delete().neq('id', '');
  if (financesError) throw financesError;
  console.log('Deleted all daily finance records.');

  const { data: vehicles, error: vehiclesError } = await supabase
    .from('vehicles')
    .select('id,data');
  if (vehiclesError) throw vehiclesError;

  for (const vehicle of vehicles ?? []) {
    const { error } = await supabase
      .from('vehicles')
      .update({
        data: {
          ...vehicle.data,
          status: 'available',
          totalTrips: 0,
          revenueGenerated: 0,
        },
      })
      .eq('id', vehicle.id);
    if (error) throw error;
  }

  console.log(`Reset ${vehicles?.length ?? 0} vehicles. Supabase data cleared successfully.`);
}

clearAll().catch((error) => {
  console.error('Error clearing Supabase data:', error);
  process.exitCode = 1;
});
