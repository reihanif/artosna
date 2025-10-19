// src/utils/auth-utils.js
import { supabase } from '@/utils/supabase'

/**
 * Force logout - clears all auth data regardless of API response
 * Use this when normal logout fails
 */
export async function forceLogout () {
  try {
    // Try to sign out from Supabase
    await supabase.auth.signOut()
  } catch (error) {
    console.warn('Supabase signOut error (ignoring):', error)
  }

  // Clear all possible Supabase storage keys
  const keysToRemove = [
    'supabase.auth.token',
    'sb-localhost-auth-token',
    'sb-auth-token',
  ]

  for (const key of keysToRemove) {
    try {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    } catch (error) {
      console.warn('Storage clear error:', error)
    }
  }

  // Clear all localStorage items that start with 'sb-'
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('sb-')) {
      localStorage.removeItem(key)
    }
  }

  return true
}

/**
 * Check if session is valid
 */
export async function isSessionValid () {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.warn('Session validation error:', error)
      return false
    }

    return !!session
  } catch (error) {
    console.warn('Session check error:', error)
    return false
  }
}

/**
 * Refresh session if needed
 */
export async function refreshSessionIfNeeded () {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return null
    }

    // Check if token is about to expire (within 5 minutes)
    const expiresAt = session.expires_at
    const now = Math.floor(Date.now() / 1000)
    const fiveMinutes = 5 * 60

    if (expiresAt - now < fiveMinutes) {
      const { data, error: refreshError } = await supabase.auth.refreshSession()

      if (refreshError) {
        console.warn('Session refresh error:', refreshError)
        return null
      }

      return data.session
    }

    return session
  } catch (error) {
    console.warn('Session refresh check error:', error)
    return null
  }
}
