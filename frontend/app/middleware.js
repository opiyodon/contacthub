import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get current pathname and search params
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  const resetToken = searchParams.get('token');

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

  // Special check for reset password route with token
  const isResetPasswordWithToken = pathname === publicRoutes.resetPassword && resetToken;

  // Get authentication token from cookies
  const authToken = request.cookies.get('token')?.value;

  try {
    // Allow access to reset password route with token regardless of auth status
    if (isResetPasswordWithToken) {
      return NextResponse.next();
    }

    // If no token and trying to access dashboard routes, redirect to login
    if (!authToken && isDashboardRoute) {
      return NextResponse.redirect(new URL(publicRoutes.login, request.url));
    }

    // If has token and on any public auth page (except reset password with token), redirect to dashboard
    if (authToken && isPublicAuthRoute && !isResetPasswordWithToken) {
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