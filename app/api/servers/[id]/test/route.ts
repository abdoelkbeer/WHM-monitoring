import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseServiceClient } from '@/lib/supabase';
import { decryptSecret } from '@/lib/crypto';
import { fetchWhmAccounts } from '@/lib/whm';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const supabase = supabaseServiceClient();
  const { data: server } = await supabase.from('servers').select('*').eq('id', params.id).single();
  if (!server) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    await fetchWhmAccounts(server.host, decryptSecret(server.token_encrypted));
    await supabase.from('servers').update({ status: 'OK' }).eq('id', server.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await supabase.from('servers').update({ status: 'ERROR' }).eq('id', server.id);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
