import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://mizzhoiredeweqdxdjam.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1penpob2lyZWRld2VxZHhkamFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDAwMDIsImV4cCI6MjA5NTkxNjAwMn0.ptiZ0b726Hv75yO9wrL0sLM3DtQOPHaAHNB1rRwTYyw');
async function run() {
  const { data: recs } = await supabase.from('recharges').select('*').eq('offer_details', 'BD Pro Lifetime Access');
  console.log('Recharges:', recs);
  if(recs && recs.length > 0) {
    const { data: users } = await supabase.from('user_profiles').select('*').eq('user_id', recs[0].user_id);
    console.log('Users:', users);
  }
}
run();
