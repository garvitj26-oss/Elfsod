import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              sameSite: 'lax',
              path: '/',
            });
          });
        },
      },
    }
  );

  // Get user session - this uses the same token from cookies
  // The session is synced from localStorage to cookies by Supabase SSR
  const {
    data: { user, session },
  } = await supabase.auth.getUser();
  
  // Refresh session if it exists to ensure cookies are up to date
  if (session) {
    await supabase.auth.refreshSession();
  }

  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication (browsing allowed)
  const publicPaths = [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/',              // Home - browsing allowed
    '/search',        // Search - browsing allowed
    '/ad-space',      // Ad space details - browsing allowed
    '/cart',          // Cart - browsing allowed (guests can view cart)
    '/ai-planner',    // AI Planner - browsing allowed (no sign-in required)
  ];

  // Paths that require authentication
  const protectedPaths = [
    '/checkout',      // Checkout requires auth
    '/profile',       // Profile requires auth
    '/bookings',      // Bookings requires auth
    '/campaigns',     // Campaigns requires auth
    '/design',        // Design requires auth
    '/admin',         // Admin requires auth
  ];

  // Check if current path is protected
  const isProtectedPath = protectedPaths.some(protectedPath => path.startsWith(protectedPath));

  // Check if current path is public (auth pages)
  const isAuthPath = path.startsWith('/auth/');

  // If user is authenticated and trying to access auth pages, redirect to home
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is NOT authenticated and trying to access protected pages, redirect to signin
  if (!user && isProtectedPath) {
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin portal routes - authentication handled by AdminPortalLayout component
  // No middleware redirects - let the component handle auth checks

  // Legacy admin routes - requires admin role from users table
  if (user && path.startsWith('/admin') && !path.startsWith('/admin-portal')) {
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!userData || userData.user_type !== 'admin') {
      // Redirect to home if not admin
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
};

