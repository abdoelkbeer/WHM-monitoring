export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    HEALTHY: 'bg-emerald-100 text-emerald-800',
    DOWN: 'bg-rose-100 text-rose-800',
    REDIRECT: 'bg-amber-100 text-amber-800',
    CRITICAL: 'bg-red-100 text-red-800'
  };
  const labels: Record<string, string> = {
    HEALTHY: 'سليم',
    DOWN: 'متوقف',
    REDIRECT: 'تحويل مشبوه',
    CRITICAL: 'خطأ حرج'
  };

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${map[status] || 'bg-slate-100'}`}>{labels[status] || status}</span>;
}
