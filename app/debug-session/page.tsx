"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugSessionPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadSession = async () => {
    setLoading(true)
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Get cookies
    const cookies = document.cookie.split(';').map(c => c.trim())
    
    setSessionInfo({
      session: session ? {
        access_token: session.access_token.substring(0, 20) + '...',
        refresh_token: session.refresh_token?.substring(0, 20) + '...',
        expires_at: session.expires_at,
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata?.role,
        }
      } : null,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
      } : null,
      cookies: cookies,
      errors: {
        sessionError: sessionError?.message,
        userError: userError?.message,
      }
    })
    
    setLoading(false)
  }

  useEffect(() => {
    loadSession()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    await loadSession()
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Session Debug Information</CardTitle>
            <CardDescription>View current authentication state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Session</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(sessionInfo?.session, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">User</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(sessionInfo?.user, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Cookies</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(sessionInfo?.cookies, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Errors</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(sessionInfo?.errors, null, 2)}
              </pre>
            </div>

            <div className="flex gap-2">
              <Button onClick={loadSession}>Refresh</Button>
              <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

