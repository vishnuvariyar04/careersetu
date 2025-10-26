import { supabase } from './supabase'

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
  return { error: null }
}

/**
 * Get the current user's session
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

/**
 * Get the dashboard URL for a user based on their role
 */
export function getDashboardUrl(userId: string, role?: string): string {
  const userRole = role || 'student'
  
  switch (userRole) {
    case 'company':
      return `/company/${userId}/dashboard`
    case 'supervisor':
      return '/supervisor/dashboard'
    case 'student':
    default:
      return `/student/${userId}/dashboard`
  }
}

/**
 * Check if the user is authenticated
 */
export async function checkAuth() {
  const { session } = await getCurrentSession()
  return !!session
}

