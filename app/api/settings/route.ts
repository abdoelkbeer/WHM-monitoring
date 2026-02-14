import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseServiceClient } from '@/lib/supabase';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const supabase = supabaseServiceClient();
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const body = await req.json();
  const supabase = supabaseServiceClient();
  const { error } = await supabase.from('settings').upsert({ ...body, id: 1, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
