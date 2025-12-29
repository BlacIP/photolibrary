import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect Admin Routes
  if (path.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value;

    // Check if token exists
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // In a decoupled architecture, we let the backend validate the token.
    // If the token is invalid, API calls will fail with 401, handling the redirect there.
    return NextResponse.next();
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
