import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseServiceClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const supabase = supabaseServiceClient();
  const from = req.nextUrl.searchParams.get('from');
  const to = req.nextUrl.searchParams.get('to');

  let q = supabase.from('incidents').select('id,type,started_at,ended_at,site_id,sites(domain)');
  if (from) q = q.gte('started_at', from);
  if (to) q = q.lte('started_at', to);

  const { data } = await q.order('started_at', { ascending: false });
  return NextResponse.json(data ?? []);
}
