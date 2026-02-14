'use client';

import { useEffect, useState } from 'react';

type Server = { id: string; name: string; host: string; last_sync_at: string | null; status: string | null };

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [form, setForm] = useState({ name: '', host: '', token: '' });

  const load = async () => {
    const res = await fetch('/api/servers');
    setServers(await res.json());
  };

  useEffect(() => { load(); }, []);

  async function addServer(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/servers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ name: '', host: '', token: '' });
    load();
  }

  async function sync(id: string) { await fetch(`/api/servers/${id}/sync`, { method: 'POST' }); load(); }
  async function test(id: string) { await fetch(`/api/servers/${id}/test`, { method: 'POST' }); load(); }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">السيرفرات</h2>
      <form onSubmit={addServer} className="card grid gap-3 md:grid-cols-4">
        <input className="rounded border p-2" placeholder="اسم السيرفر" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="rounded border p-2" placeholder="hostname أو IP" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} />
        <input className="rounded border p-2" placeholder="WHM API token" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} />
        <button className="rounded bg-slate-900 px-4 py-2 text-white">إضافة</button>
      </form>
      <div className="space-y-2">
        {servers.map((s) => (
          <div key={s.id} className="card flex items-center justify-between">
            <div>
              <p className="font-bold">{s.name}</p>
              <p className="text-sm text-slate-500">{s.host} | آخر مزامنة: {s.last_sync_at ?? '-'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => test(s.id)} className="rounded border px-3 py-1">اختبار</button>
              <button onClick={() => sync(s.id)} className="rounded bg-blue-600 px-3 py-1 text-white">مزامنة المواقع</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
