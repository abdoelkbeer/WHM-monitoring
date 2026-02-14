import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseServiceClient } from '@/lib/supabase';
import { sendAlertEmail } from '@/lib/email';

export async function POST() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const supabase = supabaseServiceClient();
  const { data } = await supabase.from('settings').select('alert_email').eq('id', 1).single();
  if (!data?.alert_email) return NextResponse.json({ error: 'Missing alert_email' }, { status: 400 });

  await sendAlertEmail(data.alert_email, 'اختبار تنبيه', '<p>تم إرسال بريد اختبار بنجاح</p>');
  return NextResponse.json({ ok: true });
}
