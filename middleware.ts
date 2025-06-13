import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';

const protectedRoutes = '/dashboard';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  // Add x-url for dynamic server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);

  let res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // No session and protected → redirect
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Session exists: verify and maybe refresh
  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresAt = new Date(parsed.expires).getTime();
      const timeLeft = expiresAt - Date.now();

      // Only refresh if <10 min left
      if (timeLeft < 10 * 60 * 1000) {
        const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
        res.cookies.set({
          name: 'session',
          value: await signToken({
            ...parsed,
            expires: expiresInOneDay.toISOString(),
          }),
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          expires: expiresInOneDay,
        });
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs',
};
