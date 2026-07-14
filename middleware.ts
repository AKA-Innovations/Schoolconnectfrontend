import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude login and public files
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check for auth token in cookies (middleware can't easily read localStorage)
  // For this exercise, we'll assume the token is also in a cookie to make middleware work
  const token = request.cookies.get('auth-token')?.value;
  const role = request.cookies.get('user-role')?.value;

  if (!token) {
    // If not authenticated, redirect to login for dashboard or root paths
    if (pathname.startsWith('/dashboard') || pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Role-based protection
  if (token && role && pathname.startsWith('/dashboard')) {
    const roleRoutes: Record<string, string> = {
      school_admin: '/dashboard/admin',
      principal: '/dashboard/principal',
      teacher: '/dashboard/teacher',
      subject_coordinator: '/dashboard/coordinator',
      student: '/dashboard/student',
    };

    const targetBase = roleRoutes[role];
    
    if (targetBase && !pathname.startsWith(targetBase)) {
      const isPrincipal = request.cookies.get('is-principal')?.value === 'true';

      // 1. Allow coordinators to access coordinator routes
      if (role === 'teacher' && pathname.startsWith('/dashboard/coordinator')) {
        // Let it pass
      }
      // 2. Allow principals to access principal & admin routes
      else if ((role === 'teacher' || role === 'principal') && isPrincipal && (pathname.startsWith('/dashboard/principal') || pathname.startsWith('/dashboard/admin'))) {
        // Let it pass
      }
      // 3. Allow principals to access teacher pages
      else if (role === 'principal' && pathname.startsWith('/dashboard/teacher')) {
        // Let it pass
      }
      else {
        // Redirect to correct dashboard if trying to access unauthorized dashboard
        return NextResponse.redirect(new URL(targetBase, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/'],
};
