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

  const accounts = await fetchWhmAccounts(server.host, decryptSecret(server.token_encrypted));
  const rows = accounts.map((a) => ({ server_id: server.id, domain: a.domain, url: `https://${a.domain}`, metadata: { user: a.user, ip: a.ip, plan: a.plan }, is_active: true }));

  if (rows.length) {
    await supabase.from('sites').upsert(rows, { onConflict: 'server_id,domain' });
  }

  await supabase.from('servers').update({ last_sync_at: new Date().toISOString(), status: 'OK' }).eq('id', server.id);
  return NextResponse.json({ synced: rows.length });
}
