'use client';

import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/status-badge';

type Site = { id: string; domain: string; current_status: string; last_check_at: string | null; screenshot_url: string | null; server_name: string };

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState('');

  async function load(nextOffset = 0, append = false) {
    const q = new URLSearchParams({ offset: String(nextOffset), limit: '20', status });
    const res = await fetch(`/api/sites?${q.toString()}`);
    const data = await res.json();
    setSites((prev) => (append ? [...prev, ...data] : data));
  }

  useEffect(() => { setOffset(0); load(0, false); }, [status]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">لوحة المواقع</h2>
      <select className="rounded border p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">كل الحالات</option>
        <option value="HEALTHY">سليم</option>
        <option value="DOWN">متوقف</option>
        <option value="REDIRECT">تحويل مشبوه</option>
        <option value="CRITICAL">خطأ حرج</option>
      </select>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {sites.map((site) => (
          <article key={site.id} className="card space-y-2">
            {site.screenshot_url ? <img src={site.screenshot_url} alt={site.domain} className="h-32 w-full rounded object-cover" loading="lazy" /> : <div className="h-32 rounded bg-slate-200" />}
            <h3 className="font-semibold">{site.domain}</h3>
            <p className="text-xs text-slate-500">{site.server_name}</p>
            <StatusBadge status={site.current_status || 'HEALTHY'} />
            <p className="text-xs">آخر فحص: {site.last_check_at ?? '-'}</p>
          </article>
        ))}
      </div>
      <button className="rounded bg-slate-900 px-4 py-2 text-white" onClick={() => { const n = offset + 20; setOffset(n); load(n, true); }}>تحميل المزيد</button>
    </div>
  );
}
