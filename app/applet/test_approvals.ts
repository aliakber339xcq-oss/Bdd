import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mizzhoiredeweqdxdjam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1penpob2lyZWRld2VxZHhkamFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDAwMDIsImV4cCI6MjA5NTkxNjAwMn0.ptiZ0b726Hv75yO9wrL0sLM3DtQOPHaAHNB1rRwTYyw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: recs } = await supabase.from('recharges').select('*').eq('offer_details', 'BD Pro Lifetime Access');
  console.log('Recharges:', recs);

  if (recs && recs.length > 0) {
     for (const r of recs) {
       console.log('Checking user_profile for', r.user_id);
       const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', r.user_id).single();
       console.log('Profile:', profile);
       
       if (r.status === 'approved') {
          const { error } = await supabase.from('user_profiles').update({ is_pro: true }).eq('user_id', r.user_id);
          console.log('Update error:', error);
       }
     }
  }
}
run();
