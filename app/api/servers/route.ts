import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { encryptSecret } from '@/lib/crypto';
import { supabaseServiceClient } from '@/lib/supabase';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const supabase = supabaseServiceClient();
  const { data, error } = await supabase.from('servers').select('id,name,host,last_sync_at,status').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await req.json();
  const supabase = supabaseServiceClient();
  const { error } = await supabase.from('servers').insert({
    name: body.name,
    host: body.host,
    token_encrypted: encryptSecret(body.token),
    status: 'UNKNOWN'
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
