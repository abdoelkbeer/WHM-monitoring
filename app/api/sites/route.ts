import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseServiceClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const supabase = supabaseServiceClient();
  const params = req.nextUrl.searchParams;
  const offset = Number(params.get('offset') || '0');
  const limit = Number(params.get('limit') || '20');
  const status = params.get('status');

  let q = supabase.from('sites').select('id,domain,current_status,last_check_at,servers(name),screenshots(public_url,captured_at)', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  if (status) q = q.eq('current_status', status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const normalized = (data ?? []).map((s: any) => ({
    id: s.id,
    domain: s.domain,
    current_status: s.current_status,
    last_check_at: s.last_check_at,
    server_name: s.servers?.name,
    screenshot_url: s.screenshots?.sort((a: any, b: any) => b.captured_at.localeCompare(a.captured_at))[0]?.public_url ?? null
  }));

  return NextResponse.json(normalized);
}
