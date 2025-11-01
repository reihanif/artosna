// src/stores/auth.js
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { forceLogout } from '@/utils/authUtils'
import { supabase } from '@/utils/supabase'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const session = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const initialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const userEmail = computed(() => user.value?.email || '')
  const userId = computed(() => user.value?.id || '')

  // User metadata getters
  const userMetadata = computed(() => user.value?.user_metadata || {})
  const displayName = computed(() => userMetadata.value.display_name || '')
  const phoneNumber = computed(() => userMetadata.value.phone_number || '')
  const dateOfBirth = computed(() => userMetadata.value.date_of_birth || '')
  const profilePicture = computed(() => userMetadata.value.profile_picture || '')
  const avatarUrl = computed(() => userMetadata.value.avatar_url || `https://ui-avatars.com/api/?name=${userMetadata.value.display_name}&format=svg&background=E8EAF6`)
  const bio = computed(() => userMetadata.value.bio || '')

  // Actions
  const clearError = () => {
    error.value = null
  }

  const setError = message => {
    error.value = message
    console.error('Auth error:', message)
  }

  const setUser = newUser => {
    user.value = newUser
  }

  const setSession = newSession => {
    session.value = newSession
    if (newSession?.user) {
      user.value = newSession.user
    }
  }

  const initializeAuth = async () => {
    if (initialized.value) {
      return
    }

    try {
      loading.value = true

      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      setSession(currentSession)
      initialized.value = true

      // Listen to auth changes
      supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession)
      })
    } catch (error) {
      setError(error.message)
    } finally {
      loading.value = false
    }
  }

  const register = async (email, password, metadata = {}) => {
    loading.value = true
    clearError()

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: metadata.display_name || '',
            phone_number: metadata.phone_number || '',
            date_of_birth: metadata.date_of_birth || '',
            profile_picture: metadata.profile_picture || '',
            bio: metadata.bio || '',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          setError('This email is already registered. Please log in.')
          return null
        }

        setSession(data.session)
      }

      return data
    } catch (error) {
      setError(error.message || 'Registration failed')
      return null
    } finally {
      loading.value = false
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error signing in with Google:', error.message)
      throw error
    }
  }

  const login = async (email, password) => {
    loading.value = true
    clearError()

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      setSession(data.session)
      return data
    } catch (error) {
      setError(error.message || 'Login failed')
      return null
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    clearError()

    try {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        throw signOutError
      }

      user.value = null
      session.value = null
      return true
    } catch (error) {
      const isSessionNotFound = error.message.includes('Auth session missing!')

      if (isSessionNotFound) {
        console.warn('Session not found, forcing logout:', error.message)

        // Force logout to clear local state
        await forceLogout()
        user.value = null
        session.value = null

        return true // Return true to allow navigation
      }

      return false
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async email => {
    loading.value = true
    clearError()

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) {
        throw resetError
      }

      return true
    } catch (error) {
      const isSessionNotFound = error.message.includes('Auth session missing!')

      if (isSessionNotFound) {
        console.warn('Session not found, forcing logout:', error.message)

        // Force logout to clear local state
        await forceLogout()
        user.value = null
        session.value = null

        return true // Return true to allow navigation
      }

      setError(error.message || 'Password reset failed')
      return false
    } finally {
      loading.value = false
    }
  }

  const updatePassword = async newPassword => {
    loading.value = true
    clearError()

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        throw updateError
      }

      return true
    } catch (error) {
      const isSessionNotFound = error.message.includes('Auth session missing!')

      if (isSessionNotFound) {
        console.warn('Session not found, forcing logout:', error.message)

        // Force logout to clear local state
        await forceLogout()
        user.value = null
        session.value = null

        return true // Return true to allow navigation
      }

      setError(error.message || 'Password update failed')
      return false
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async updates => {
    loading.value = true
    clearError()

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: updates,
      })

      if (updateError) {
        throw updateError
      }

      if (data.user) {
        setUser(data.user)
      }

      return data
    } catch (error) {
      const isSessionNotFound = error.message.includes('Auth session missing!')

      if (isSessionNotFound) {
        console.warn('Session not found, forcing logout:', error.message)

        // Force logout to clear local state
        await forceLogout()
        user.value = null
        session.value = null

        return true // Return true to allow navigation
      }

      setError(error.message || 'Profile update failed')
      return null
    } finally {
      loading.value = false
    }
  }

  const updateUserMetadata = async metadata => {
    loading.value = true
    clearError()

    try {
      const currentMetadata = user.value?.user_metadata || {}

      const updatedMetadata = {
        ...currentMetadata,
        ...metadata,
      }

      const { data, error: updateError } = await supabase.auth.updateUser({
        data: updatedMetadata,
      })

      if (updateError) {
        throw updateError
      }

      if (data.user) {
        setUser(data.user)
      }

      return data
    } catch (error) {
      const isSessionNotFound = error.message.includes('Auth session missing!')

      if (isSessionNotFound) {
        console.warn('Session not found, forcing logout:', error.message)

        // Force logout to clear local state
        await forceLogout()
        user.value = null
        session.value = null

        return true // Return true to allow navigation
      }

      setError(error.message || 'Metadata update failed')
      return null
    } finally {
      loading.value = false
    }
  }

  const refreshSession = async () => {
    try {
      const { data, error: refreshError } = await supabase.auth.refreshSession()

      if (refreshError) {
        throw refreshError
      }

      setSession(data.session)
      return data.session
    } catch (error) {
      setError(error.message || 'Session refresh failed')
      return null
    }
  }

  return {
    // State
    user,
    session,
    loading,
    error,
    initialized,

    // Getters
    isAuthenticated,
    userEmail,
    userId,
    userMetadata,
    displayName,
    phoneNumber,
    dateOfBirth,
    profilePicture,
    avatarUrl,
    bio,

    // Actions
    initializeAuth,
    register,
    login,
    signInWithGoogle,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    updateUserMetadata,
    refreshSession,
    clearError,
    setError,
  }
})
