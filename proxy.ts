import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get('session')?.value;
  const payload = sessionToken ? await decrypt(sessionToken) : null;

  // Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect Student Routes
  if (pathname.startsWith('/student') || pathname.startsWith('/exam')) {
    if (!payload || payload.role !== 'student') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from login/register to their dashboard
  if (pathname === '/login' || pathname === '/register') {
    if (payload) {
      if (payload.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else {
        return NextResponse.redirect(new URL('/student', request.url));
      }
    }
  }

  // For API routes, add logging requested in Step 1
  if (pathname.startsWith('/api')) {
    console.log(`\n[API START] ${request.method} ${pathname}`);
    const response = NextResponse.next();
    console.log(`[API END] ${request.method} ${pathname} - Status: ${response.status}`);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/exam/:path*', '/login', '/register'],
};
