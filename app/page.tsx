import Link from 'next/link';

const highlights = [
  { title: 'مراقبة مستمرة', text: 'فحص تلقائي للمواقع مع تنبيهات فورية عند أي انقطاع.' },
  { title: 'رؤية واضحة', text: 'لوحة تحكم مرئية للحالة العامة، الحوادث، والتقارير.' },
  { title: 'تنبيهات ذكية', text: 'إرسال بريد إلكتروني عند فتح incident وفق إعداداتك.' }
];

export default function HomePage() {
  return (
    <section className="space-y-16 pb-10">
      <div className="hero-panel overflow-hidden rounded-3xl p-8 md:p-14">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-sm text-cyan-100">
              WHM Monitoring Platform
            </p>
            <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
              راقب مواقعك باحترافية
              <span className="block text-cyan-300">وانطلق بدون مفاجآت</span>
            </h1>
            <p className="max-w-xl text-base text-slate-200 md:text-lg">
              منصة عربية لمراقبة مواقع WordPress على WHM/cPanel مع تنبيهات مباشرة وتقارير سهلة القراءة.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">
                ابدأ الآن
              </Link>
              <Link href="/sites" className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                استعرض لوحة المراقبة
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-200/20 bg-slate-950/50 p-5 shadow-2xl backdrop-blur">
            <div className="grid gap-3 sm:grid-cols-2">
              {['99.95% Uptime', '12 Active Servers', '342 Monitored Sites', '3 Open Incidents'].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.title} className="card border-white/10 bg-slate-950/60 text-slate-100">
            <h3 className="mb-2 text-lg font-bold text-cyan-300">{item.title}</h3>
            <p className="text-sm text-slate-300">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
