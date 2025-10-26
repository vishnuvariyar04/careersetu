import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { getDashboardUrl } from '@/lib/auth-helpers'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const redirectToDashboard = () => {
    if (user) {
      const role = user.user_metadata?.role || 'student'
      const dashboardUrl = getDashboardUrl(user.id, role)
      router.push(dashboardUrl)
    }
  }

  return {
    user,
    session,
    loading,
    signOut,
    redirectToDashboard,
    isAuthenticated: !!user,
  }
}

