import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get current pathname and search params
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  const resetToken = searchParams.get('token');

  // Debug logs
  console.log('Current pathname:', pathname);
  console.log('Reset token present:', !!resetToken);

  // Define authentication-related routes
  const publicRoutes = {
    login: '/',
    register: '/register',
    forgotPassword: '/forgot_password',
    resetPassword: '/reset_password'
  };

  // Check if route is dashboard or its subroutes
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Check specifically for reset password route
  const isResetPasswordRoute = pathname === publicRoutes.resetPassword;

  // Get authentication token from cookies
  const authToken = request.cookies.get('token')?.value;

  try {
    // First priority: Handle reset password with token
    if (isResetPasswordRoute && resetToken) {
      console.log('Allowing access to reset password with token');
      return NextResponse.next();
    }

    // If trying to access reset password without token
    if (isResetPasswordRoute && !resetToken) {
      console.log('Redirecting to forgot password - no token');
      return NextResponse.redirect(new URL(publicRoutes.forgotPassword, request.url));
    }

    // If no auth token and trying to access dashboard
    if (!authToken && isDashboardRoute) {
      console.log('Redirecting to login - no auth token');
      return NextResponse.redirect(new URL(publicRoutes.login, request.url));
    }

    // If authenticated and trying to access public routes
    if (authToken && Object.values(publicRoutes).includes(pathname) && !isResetPasswordRoute) {
      console.log('Redirecting to dashboard - already authenticated');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Allow all other requests to proceed
    console.log('Allowing request to proceed');
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL(publicRoutes.login, request.url));
  }
}

// Configure which routes middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};