import { supabaseServiceClient } from '@/lib/supabase';

async function main() {
  const supabase = supabaseServiceClient();
  const { error } = await supabase.from('settings').upsert({
    id: 1,
    alert_email: '',
    notify_on_resolve: false,
    check_interval_minutes: 5,
    screenshot_interval_minutes: 30,
    whm_sync_interval_hours: 6,
    open_threshold: 2,
    close_threshold: 2
  });

  if (error) throw error;
  console.log('settings seeded');
}

main().catch((e) => { console.error(e); process.exit(1); });
