import { supabaseServiceClient } from '@/lib/supabase';

export default async function ReportsPage() {
  const supabase = supabaseServiceClient();
  const { data: incidents } = await supabase.from('incidents').select('id,type,started_at,ended_at,site_id,sites(domain)').order('started_at', { ascending: false }).limit(100);
  const { data: top } = await supabase.rpc('top_problematic_sites');

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">التقارير</h2>
      <section className="card">
        <h3 className="mb-2 font-semibold">آخر الحوادث</h3>
        <table className="w-full text-sm">
          <thead><tr><th>الموقع</th><th>النوع</th><th>البداية</th><th>النهاية</th></tr></thead>
          <tbody>{incidents?.map((i: any) => <tr key={i.id}><td>{i.sites?.domain}</td><td>{i.type}</td><td>{i.started_at}</td><td>{i.ended_at ?? '-'}</td></tr>)}</tbody>
        </table>
      </section>
      <section className="card">
        <h3 className="mb-2 font-semibold">أكثر المواقع مشاكل</h3>
        <ul>{top?.map((t: any) => <li key={t.site_id}>{t.domain}: {t.incident_count}</li>)}</ul>
      </section>
    </div>
  );
}
