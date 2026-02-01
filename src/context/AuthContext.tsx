import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, Profile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Delay constants for session restoration
  const SESSION_RESTORATION_DELAY = 1000 // Allow time for session to be restored from storage on mount
  const PROFILE_CLEAR_DELAY = 300 // Small delay to avoid UI flicker when clearing profile
  const MAX_RETRY_ATTEMPTS = 3 // Maximum number of session restoration retries
  const RETRY_DELAY = 500 // Delay between retry attempts

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const createProfile = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          credits: 3, // 3 free credits on signup
        })

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error
      }
      
      // Fetch the profile after creation
      await fetchProfile(user.id)
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  // Helper function to handle profile fetching/creation
  const ensureProfile = async (userId: string) => {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      await createProfile({ id: userId } as User)
    } else {
      setProfile(existingProfile)
    }
  }

  useEffect(() => {
    let isMounted = true
    let logoutTimer: NodeJS.Timeout | null = null
    let retryAttempts = 0

    // Get initial session with retry logic
    const getSessionWithRetry = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          
          // Retry if we haven't exceeded max attempts
          if (retryAttempts < MAX_RETRY_ATTEMPTS) {
            retryAttempts++
            console.log(`Retrying session restoration (attempt ${retryAttempts}/${MAX_RETRY_ATTEMPTS})`)
            setTimeout(() => {
              if (isMounted) getSessionWithRetry()
            }, RETRY_DELAY)
            return
          } else {
            // Exhausted retry attempts, stop loading
            console.log('Max retry attempts reached, stopping')
            if (isMounted) setLoading(false)
            return
          }
        }
        
        if (!isMounted) return
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('Session restored for user:', session.user.id)
          fetchProfile(session.user.id).then(() => {
            if (isMounted) setLoading(false)
          })
        } else {
          // Add delay before declaring logged out to allow session restoration
          setTimeout(() => {
            if (isMounted) {
              console.log('No session found after waiting')
              setLoading(false)
            }
          }, SESSION_RESTORATION_DELAY)
        }
      } catch (err) {
        console.error('Unexpected error getting session:', err)
        if (isMounted) setLoading(false)
      }
    }

    getSessionWithRetry()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.id ? `(user: ${session.user.id})` : '(no user)')
      
      if (!isMounted) return

      // Handle specific events
      if (event === 'INITIAL_SESSION') {
        // Handle initial session on mount
        if (session?.user) {
          console.log('Initial session detected:', session.user.id)
          setSession(session)
          setUser(session.user)
          await ensureProfile(session.user.id)
        }
        // Note: loading state is managed by getSessionWithRetry, don't set it here to avoid race condition
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Clear any pending logout timer
        if (logoutTimer) {
          clearTimeout(logoutTimer)
          logoutTimer = null
        }
        
        console.log('User signed in or token refreshed:', session?.user?.id)
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await ensureProfile(session.user.id)
        }
        
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
      } else {
        // For other events, update state
        console.log('Other auth event:', event)
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await ensureProfile(session.user.id)
        } else {
          // Add delay before clearing profile to avoid flicker
          logoutTimer = setTimeout(() => {
            if (isMounted) {
              setProfile(null)
            }
          }, PROFILE_CLEAR_DELAY)
        }
        
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      if (logoutTimer) {
        clearTimeout(logoutTimer)
      }
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) throw error
  }

  const signInWithEmail = async (email: string) => {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
