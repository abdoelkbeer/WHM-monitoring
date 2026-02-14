import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes = ['/servers', '/sites', '/issues', '/reports', '/settings'];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const shouldProtect = protectedRoutes.some((route) => path.startsWith(route));
  if (!shouldProtect) return NextResponse.next();

  const hasSession = req.cookies.get('sb-access-token') || req.cookies.get('sb:token');
  if (!hasSession) return NextResponse.redirect(new URL('/login', req.url));

  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
