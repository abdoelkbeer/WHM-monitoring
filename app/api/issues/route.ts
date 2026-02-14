import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseServiceClient } from '@/lib/supabase';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const supabase = supabaseServiceClient();
  const { data } = await supabase.from('incidents').select('*, sites(domain)').eq('is_open', true);
  return NextResponse.json(data ?? []);
}
