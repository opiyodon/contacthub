import { NextResponse } from 'next/server';

// This middleware runs on every request
export function middleware(request) {
  // Get current pathname
  const pathname = request.nextUrl.pathname;

  // Define authentication-related routes
  const publicRoutes = {
    login: '/',
    register: '/register',
    forgotPassword: '/forgot_password',
    resetPassword: '/reset_password'
  };
  
  // Check if route is dashboard or its subroutes
  const isDashboardRoute = pathname.startsWith('/dashboard');
  
  // Check if current route is any of the public authentication routes
  const isPublicAuthRoute = Object.values(publicRoutes).includes(pathname);
  
  // Get authentication token from cookies
  const authToken = request.cookies.get('token')?.value;

  try {
    // If no token and trying to access dashboard routes, redirect to login
    if (!authToken && isDashboardRoute) {
      return NextResponse.redirect(new URL(publicRoutes.login, request.url));
    }

    // If has token and on any public auth page, redirect to dashboard
    if (authToken && isPublicAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Otherwise, continue with the request
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of any errors, redirect to login page
    return NextResponse.redirect(new URL(publicRoutes.login, request.url));
  }
}

// Configure which routes middleware runs on
export const config = {
  matcher: [
    '/',
    '/register',
    '/forgot_password',
    '/reset_password',
    '/dashboard/:path*'
  ]
};