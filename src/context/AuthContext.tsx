import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, Profile } from '../lib/supabase'

const DEFAULT_SIGNUP_CREDITS = 3;

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
    const profileFetchPromise = useRef<Promise<Profile | null> | null>(null)

    const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
          try {
                  const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single()
                  if (error) {
                            if (error.code === 'PGRST116') return null
                            return null
                  }
                  return data
          } catch (error) {
                  return null
          }
    }, [])

    const createProfile = async (currentUser: User): Promise<Profile | null> => {
          try {
                  const { error } = await supabase.from('profiles').insert({
                            id: currentUser.id,
                            email: currentUser.email,
                            full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
                            avatar_url: currentUser.user_metadata?.avatar_url,
                            credits: DEFAULT_SIGNUP_CREDITS,
                  })
                  // 23505 = unique violation (profile already exists), safe to ignore
            if (error && error.code !== '23505') {
                      console.error('createProfile error:', error)
                      return null
            }
                  return await fetchProfile(currentUser.id)
          } catch (err) {
                  console.error('createProfile exception:', err)
                  return null
          }
    }

    // Deduplicate concurrent calls using a shared Promise ref
    const ensureProfile = async (currentUser: User): Promise<Profile | null> => {
          if (profileFetchPromise.current) {
                  return profileFetchPromise.current
          }
          profileFetchPromise.current = (async () => {
                  try {
                            const existing = await fetchProfile(currentUser.id)
                            if (existing) return existing
                            return await createProfile(currentUser)
                  } finally {
                            profileFetchPromise.current = null
                  }
          })()
          return profileFetchPromise.current
    }

    useEffect(() => {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
                  async (event, currentSession) => {
                            if (event === 'INITIAL_SESSION') {
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
                            } else if (event === 'SIGNED_IN' && currentSession?.user) {
                                        if (initialLoadDone.current) {
                                                      setSession(currentSession)
                                                      setUser(currentSession.user)
                                                      const profileData = await ensureProfile(currentSession.user)
                                                      setProfile(profileData)
                                        }
                                        setLoading(false)
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
                                    console.warn('Auth timeout — forcing loading=false')
                                    setLoading(false)
                                    initialLoadDone.current = true
                          }
                  }, 5000)

                  return () => {
                          subscription.unsubscribe()
                          clearTimeout(timeout)
                  }
    }, [fetchProfile])

    const signInWithGoogle = async () => {
          await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                            redirectTo: `${window.location.origin}/auth/callback`,
                            queryParams: { prompt: 'select_account' },
                  },
          })
    }

    const signInWithEmail = async (email: string) => {
          return await supabase.auth.signInWithOtp({
                  email,
                  options: {
                            emailRedirectTo: `${window.location.origin}/auth/callback`,
                  },
          })
    }

    const signOut = async () => {
          await supabase.auth.signOut()
          setUser(null)
          setSession(null)
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
                  refreshProfile: async () => {
                            if (user) setProfile(await fetchProfile(user.id))
                  },
                  refreshSession: async () => {
                            await supabase.auth.refreshSession()
                  }
          }}>
            {children}
          </AuthContext.Provider>AuthContext.Provider>
        )
}
