import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/**
 * Custom hook to verify that the logged-in user matches the student_id in the URL
 * Redirects to the correct dashboard if there's a mismatch
 * @param studentId - The student_id from the URL params
 * @returns isAuthorized - true if authorized, null while checking, false if unauthorized
 */
export function useStudentAuth(studentId: string) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuthorization = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // No user logged in, redirect to auth
        console.warn('No authenticated user found, redirecting to login')
        router.push('/auth/login')
        return
      }
      
      // Check if the authenticated user's ID matches the student_id in the URL
      if (user.id !== studentId) {
        console.warn('Unauthorized access attempt: User ID does not match student_id')
        console.log(`Expected: ${studentId}, Got: ${user.id}`)
        
        // Redirect to the correct dashboard for this user
        const role = user.user_metadata?.role || 'student'
        if (role === 'company') {
          router.push(`/company/${user.id}/dashboard`)
        } else if (role === 'supervisor') {
          router.push('/supervisor/dashboard')
        } else {
          router.push(`/student/${user.id}/dashboard`)
        }
        setIsAuthorized(false)
        return
      }
      
      // User is authorized
      setIsAuthorized(true)
    }
    
    checkAuthorization()
  }, [studentId, router])

  return isAuthorized
}

