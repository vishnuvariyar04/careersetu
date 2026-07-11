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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      const user = data.session.user
      const provider = user.app_metadata?.provider

      // GitHub login = strictly student — override any stale metadata
      if (provider === 'github') {
        await supabase.auth.updateUser({ data: { role: 'student' } })

        // Ensure a students row exists (required by FK on student_skills, etc.)
        const meta = user.user_metadata || {}
        const fullName = meta.full_name || meta.name || meta.user_name || meta.preferred_username || 'Student'
        const email = user.email || meta.email || ''
        const githubUrl = meta.user_name
          ? `https://github.com/${meta.user_name}`
          : meta.preferred_username
            ? `https://github.com/${meta.preferred_username}`
            : null

        await supabase.from('students').upsert(
          {
            student_id: user.id,
            full_name: fullName,
            email,
            ...(githubUrl ? { github_url: githubUrl } : {}),
          },
          { onConflict: 'student_id' }
        )

        const response = NextResponse.redirect(`${origin}/student/${user.id}/dashboard`)

        cookieStore.forEach((cookie, name) => {
          response.cookies.set({ name, value: cookie.value, ...cookie.options })
        })

        return response
      }

      // Non-GitHub (email/password) — follow the next param
      const response = NextResponse.redirect(`${origin}${next}`)
      
      cookieStore.forEach((cookie, name) => {
        response.cookies.set({ name, value: cookie.value, ...cookie.options })
      })

      return response
    }
  }

  // Error case
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}