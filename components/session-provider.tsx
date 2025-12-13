"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'

interface SessionContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export function useSession() {
  return useContext(SessionContext)
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      console.log('SessionProvider: Initial session loaded', {
        hasUser: !!session?.user,
        email: session?.user?.email,
        pathname,
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('SessionProvider: Auth state changed', {
        event,
        hasUser: !!session?.user,
        email: session?.user?.email,
        pathname,
      })

      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle auth events
      if (event === 'SIGNED_IN') {
        console.log('User signed in, refreshing router')
        router.refresh()
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        // router.push('/auth')
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed')
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])

  const signOut = async () => {
    console.log('SessionProvider: Signing out')
    await supabase.auth.signOut()
    // window.location.reload()
    // router.push('/auth')
  }

  return (
    <SessionContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </SessionContext.Provider>
  )
}

