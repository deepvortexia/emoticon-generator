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
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const initialLoadDone = useRef(false)
  const fetchingProfile = useRef(false)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) {
        if (error.code === 'PGRST116') return null
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
      const { error } = await supabase.from('profiles').insert({
        id: currentUser.id,
        email: currentUser.email,
        full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
        avatar_url: currentUser.user_metadata?.avatar_url,
        credits: 3,
      })
      if (error && error.code !== '23505') throw error
      return await fetchProfile(currentUser.id)
    } catch (error) {
      console.error('Error creating profile:', error)
      return null
    }
  }, [fetchProfile])

  const ensureProfile = useCallback(async (currentUser: User) => {
    if (fetchingProfile.current) return null
    fetchingProfile.current = true
    try {
      let profileData = await fetchProfile(currentUser.id)
      if (!profileData) profileData = await createProfile(currentUser)
      return profileData
    } finally {
      fetchingProfile.current = false
    }
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth event:', event)

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (currentSession?.user) {
            setSession(currentSession)
            setUser(currentSession.user)
            const profileData = await ensureProfile(currentSession.user)
            setProfile(profileData)
          } else {
            setUser(null)
            setSession(null)
            setProfile(null)
          }
          setLoading(false)
          initialLoadDone.current = true

        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
          setProfile(null)
          setLoading(false)

        } else if (event === 'TOKEN_REFRESHED' && currentSession) {
          setSession(currentSession)
        }
      }
    )

    const timeout = setTimeout(() => {
      if (!initialLoadDone.current) {
        setLoading(false)
      }
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [ensureProfile])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirige toujours vers le domaine racine pour stabiliser le cookie
        redirectTo: `https://deepvortexai.art/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) throw error
  }

  const signInWithEmail = async (email: string) => {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `https://deepvortexai.art/auth/callback`,
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    // Nettoyage manuel au cas où pour forcer le mariage à se terminer proprement
    setUser(null)
    setSession(null)
    setProfile(null)
    // On redirige vers le hub pour s'assurer que le cookie est supprimé partout
    window.location.href = 'https://deepvortexai.art'
  }

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading,
      signInWithGoogle, signInWithEmail, signOut, refreshProfile, refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
