import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect Admin Routes
  if (path.startsWith('/admin')) {
    const session = request.cookies.get('session')?.value;
    
    // Check if session exists and is valid
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await decrypt(session);
      // Valid session, proceed
      return NextResponse.next();
    } catch (err) {
      // Invalid token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect root to admin (or home later)
  if (path === '/') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
