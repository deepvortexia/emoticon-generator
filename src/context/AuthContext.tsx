import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
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
  refreshSession: () => Promise<void>
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
  const initialized = useRef(false)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, [])

  const createProfile = useCallback(async (currentUser: User): Promise<Profile | null> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
          avatar_url: currentUser.user_metadata?.avatar_url,
          credits: 3,
        })

      if (error && error.code !== '23505') {
        throw error
      }
      
      return await fetchProfile(currentUser.id)
    } catch (error) {
      console.error('Error creating profile:', error)
      return null
    }
  }, [fetchProfile])

  const ensureProfile = useCallback(async (currentUser: User) => {
    let profileData = await fetchProfile(currentUser.id)
    if (!profileData) {
      profileData = await createProfile(currentUser)
    }
    return profileData
  }, [fetchProfile, createProfile])

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }, [user, fetchProfile])

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      if (data.user) {
        const profileData = await fetchProfile(data.user.id)
        if (profileData) setProfile(profileData)
      }
    } catch (err) {
      console.error('Session refresh failed:', err)
    }
  }, [fetchProfile])

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initialized.current) return
    initialized.current = true

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth event:', event)

        if (currentSession?.user) {
          setSession(currentSession)
          setUser(currentSession.user)
          
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(async () => {
            const profileData = await ensureProfile(currentSession.user)
            setProfile(profileData)
            setLoading(false)
          }, 0)
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session: initialSession }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
        setLoading(false)
        return
      }

      if (initialSession?.user) {
        setSession(initialSession)
        setUser(initialSession.user)
        const profileData = await ensureProfile(initialSession.user)
        setProfile(profileData)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [ensureProfile])

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

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signOut,
      refreshProfile,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
