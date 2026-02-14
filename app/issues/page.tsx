import { supabaseServiceClient } from '@/lib/supabase';

export default async function IssuesPage() {
  const supabase = supabaseServiceClient();
  const { data } = await supabase.from('incidents').select('id,type,started_at,sites(domain)').eq('is_open', true).order('started_at', { ascending: false });
  const grouped = { REDIRECT: [] as any[], CRITICAL: [] as any[], DOWN: [] as any[] };
  data?.forEach((i) => grouped[i.type as keyof typeof grouped]?.push(i));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">المواقع المتعثرة</h2>
      {(['REDIRECT', 'CRITICAL', 'DOWN'] as const).map((type) => (
        <section key={type} className="card">
          <h3 className="mb-2 font-bold">{type === 'REDIRECT' ? 'إعادة توجيه' : type === 'CRITICAL' ? 'أخطاء حرجة' : 'متوقف'}</h3>
          <ul className="space-y-1 text-sm">{grouped[type].map((item: any) => <li key={item.id}>{item.sites?.domain} - {item.started_at}</li>)}</ul>
        </section>
      ))}
    </div>
  );
}
