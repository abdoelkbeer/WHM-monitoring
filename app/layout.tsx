import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WHM Monitoring',
  description: 'مراقبة مواقع ووردبريس عبر WHM/cPanel'
};

const nav = [
  { href: '/', label: 'الرئيسية' },
  { href: '/servers', label: 'السيرفرات' },
  { href: '/sites', label: 'لوحة المواقع' },
  { href: '/issues', label: 'المواقع المتعثرة' },
  { href: '/reports', label: 'التقارير' },
  { href: '/settings', label: 'الإعدادات' }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <header className="sticky top-0 z-10 border-b border-white/60 bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
            <h1 className="text-lg font-black text-slate-950">WHM Monitoring</h1>
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-slate-600 transition hover:text-cyan-700">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl p-6">{children}</main>
      </body>
    </html>
  );
}
