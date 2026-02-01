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

  useEffect(() => {
    let isMounted = true
    let logoutTimer: NodeJS.Timeout | null = null

    // Get initial session with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
      }
      
      if (!isMounted) return
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        fetchProfile(session.user.id).then(() => {
          if (isMounted) setLoading(false)
        })
      } else {
        // Add small delay before declaring logged out to allow session restoration
        setTimeout(() => {
          if (isMounted) setLoading(false)
        }, 500)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)
      
      if (!isMounted) return

      // Handle specific events
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Clear any pending logout timer
        if (logoutTimer) {
          clearTimeout(logoutTimer)
          logoutTimer = null
        }
        
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Check if profile exists, if not create it
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!existingProfile) {
            await createProfile(session.user)
          } else {
            setProfile(existingProfile)
          }
        }
        
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
      } else {
        // For other events, update state
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!existingProfile) {
            await createProfile(session.user)
          } else {
            setProfile(existingProfile)
          }
        } else {
          // Add delay before clearing profile to avoid flicker
          logoutTimer = setTimeout(() => {
            if (isMounted) {
              setProfile(null)
            }
          }, 300)
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
