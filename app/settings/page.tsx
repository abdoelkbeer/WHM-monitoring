'use client';

import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);

  const load = async () => {
    const res = await fetch('/api/settings');
    setSettings(await res.json());
  };

  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    load();
  }

  if (!settings) return <p>Loading...</p>;

  return (
    <form onSubmit={save} className="card space-y-3">
      <h2 className="text-2xl font-bold">الإعدادات</h2>
      <input className="w-full rounded border p-2" value={settings.alert_email ?? ''} onChange={(e) => setSettings({ ...settings, alert_email: e.target.value })} placeholder="بريد التنبيهات" />
      <label className="flex items-center gap-2"><input type="checkbox" checked={settings.notify_on_resolve} onChange={(e) => setSettings({ ...settings, notify_on_resolve: e.target.checked })} /> إشعار عند الحل</label>
      <input className="w-full rounded border p-2" type="number" value={settings.check_interval_minutes} onChange={(e) => setSettings({ ...settings, check_interval_minutes: Number(e.target.value) })} placeholder="فاصل الفحص" />
      <input className="w-full rounded border p-2" type="number" value={settings.screenshot_interval_minutes} onChange={(e) => setSettings({ ...settings, screenshot_interval_minutes: Number(e.target.value) })} placeholder="فاصل الصور" />
      <button className="rounded bg-slate-900 px-4 py-2 text-white">حفظ</button>
      <button type="button" className="rounded border px-4 py-2" onClick={() => fetch('/api/settings/test-email', { method: 'POST' })}>اختبار SMTP</button>
    </form>
  );
}
