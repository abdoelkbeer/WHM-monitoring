'use client';

import { useState } from 'react';
import { supabaseBrowserClient } from '@/lib/supabase';

const supabase = supabaseBrowserClient();

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    document.cookie = 'sb-access-token=1;path=/';
    window.location.href = '/sites';
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto max-w-md space-y-3">
      <h2 className="text-xl font-bold">تسجيل الدخول</h2>
      <input className="w-full rounded border p-2" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded border p-2" type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button className="rounded bg-slate-900 px-4 py-2 text-white">دخول</button>
    </form>
  );
}
