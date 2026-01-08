import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Default to home '/', or use 'next' param if provided
  const next = searchParams.get('next') ?? '/learn'

  if (code) {
    const cookieStore = new Map()
    
    // 1. Create Client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = request.headers.get('Cookie') || ''
            return cookie.split('; ').find((c) => c.startsWith(`${name}=`))?.split('=')[1]
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set(name, { value, options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set(name, { value: '', options })
          },
        },
      }
    )

    // 2. Exchange Code
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 3. Create Response with Redirect
      const response = NextResponse.redirect(`${origin}${next}`)
      
      // 4. Apply Cookies to Response (Crucial for persistence)
      cookieStore.forEach((cookie, name) => {
        response.cookies.set({
          name,
          value: cookie.value,
          ...cookie.options,
        })
      })

      return response
    }
  }

  // Error case
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}