import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Debug: Log all cookies
  const allCookies = request.cookies.getAll()
  console.log('All cookies in middleware:', allCookies.map(c => c.name))
  
  // Refresh session if expired - required for Server Components
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  
  console.log("User in middleware:", {
    hasUser: !!user,
    email: user?.email,
    error: userError?.message,
  })
  
  const { pathname } = request.nextUrl

  // Define your routes
  const protectedRoutes = ['/student', '/company', '/supervisor']
  const authRoutes = ['/auth'] // All auth routes
  const publicOnlyWhenLoggedOut = ['/', '/auth'] // Routes that should redirect if logged in

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  const isPublicOnlyRoute = publicOnlyWhenLoggedOut.some((route) => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Debug logging (you can remove these later)
  console.log('Middleware:', {
    pathname,
    hasUser: !!user,
    userEmail: user?.email,
    userId: user?.id,
    role: user?.user_metadata?.role,
    isProtectedRoute,
    isAuthRoute,
    isPublicOnlyRoute,
  })

  // If user is logged in and tries to access public-only routes (including / and /auth/*)
  if (user && isPublicOnlyRoute) {
    // Check if there's user metadata to determine role
    const userMetadata = user.user_metadata || {}
    const role = userMetadata.role || 'student' // Default to student if no role
    
    console.log('Redirecting authenticated user from:', pathname, 'to dashboard. Role:', role)
    
    // Redirect to appropriate dashboard based on role
    let dashboardUrl
    if (role === 'company') {
      dashboardUrl = new URL(`/company/${user.id}/dashboard`, request.url)
    } else if (role === 'supervisor') {
      dashboardUrl = new URL('/supervisor/dashboard', request.url)
    } else {
      dashboardUrl = new URL(`/student/${user.id}/dashboard`, request.url)
    }
    
    return NextResponse.redirect(dashboardUrl)
  }

  // If user is not logged in and tries to access protected routes
  if (!user && isProtectedRoute) {
    console.log('Redirecting unauthenticated user from:', pathname, 'to auth')
    const authUrl = new URL('/auth', request.url)
    authUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(authUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any files with an extension in public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[^.]+$).*)',
  ],
}
