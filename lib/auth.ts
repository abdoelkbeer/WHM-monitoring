import { NextResponse } from 'next/server';

export async function requireAdmin() {
  return { user: { id: 'single-admin' }, error: undefined as NextResponse | undefined };
}
