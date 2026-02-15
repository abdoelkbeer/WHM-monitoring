'use client';

import { useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    setOffset(0);
    load(0, false);
  }, [status]);

  const stats = useMemo(() => {
    const total = sites.length;
    const healthy = sites.filter((s) => s.current_status === 'HEALTHY').length;
    const issues = sites.filter((s) => s.current_status !== 'HEALTHY').length;
    const critical = sites.filter((s) => s.current_status === 'CRITICAL' || s.current_status === 'DOWN').length;
    return { total, healthy, issues, critical };
  }, [sites]);

  return (
    <div className="space-y-6">
      <section className="dashboard-shell rounded-3xl p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-300">مرحبًا بك 👋</p>
            <h2 className="text-3xl font-black text-white">لوحة مراقبة المواقع</h2>
          </div>

          <select className="rounded-xl border border-white/15 bg-slate-900/70 p-2 text-sm text-white" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">كل الحالات</option>
            <option value="HEALTHY">سليم</option>
            <option value="DOWN">متوقف</option>
            <option value="REDIRECT">تحويل مشبوه</option>
            <option value="CRITICAL">خطأ حرج</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="إجمالي المواقع" value={stats.total} tone="cyan" />
          <StatCard title="مواقع سليمة" value={stats.healthy} tone="emerald" />
          <StatCard title="مشاكل مفتوحة" value={stats.issues} tone="rose" />
          <StatCard title="حرجة / متوقفة" value={stats.critical} tone="violet" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">قائمة المواقع</h3>
            <button className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white" onClick={() => load(0, false)}>
              تحديث
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sites.map((site) => (
              <article key={site.id} className="rounded-xl border border-slate-200 p-3">
                {site.screenshot_url ? (
                  <img src={site.screenshot_url} alt={site.domain} className="mb-3 h-32 w-full rounded object-cover" loading="lazy" />
                ) : (
                  <div className="mb-3 h-32 rounded bg-slate-200" />
                )}
                <h4 className="font-semibold">{site.domain}</h4>
                <p className="text-xs text-slate-500">{site.server_name}</p>
                <div className="mt-2">
                  <StatusBadge status={site.current_status || 'HEALTHY'} />
                </div>
              </article>
            ))}
          </div>

          <button className="mt-4 rounded bg-slate-900 px-4 py-2 text-white" onClick={() => { const n = offset + 20; setOffset(n); load(n, true); }}>
            تحميل المزيد
          </button>
        </article>

        <article className="card">
          <h3 className="mb-4 text-lg font-bold">ملخص سريع</h3>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><span>آخر فحص</span><span>{sites[0]?.last_check_at ?? '-'}</span></li>
            <li className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><span>نسبة السلامة</span><span>{stats.total ? Math.round((stats.healthy / stats.total) * 100) : 0}%</span></li>
            <li className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><span>حالات تحتاج مراجعة</span><span>{stats.issues}</span></li>
          </ul>
        </article>
      </section>
    </div>
  );
}

function StatCard({ title, value, tone }: { title: string; value: number; tone: 'cyan' | 'emerald' | 'rose' | 'violet' }) {
  const toneClass: Record<typeof tone, string> = {
    cyan: 'from-cyan-400/80 to-sky-500/70',
    emerald: 'from-emerald-400/80 to-teal-500/70',
    rose: 'from-rose-400/80 to-pink-500/70',
    violet: 'from-violet-400/80 to-purple-500/70'
  };

  return (
    <article className={`rounded-2xl bg-gradient-to-br p-4 text-slate-950 shadow-lg ${toneClass[tone]}`}>
      <p className="text-xs font-semibold">{title}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </article>
  );
}
