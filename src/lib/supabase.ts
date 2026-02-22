import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing.')
}

// Custom storage that uses cookies on parent domain for cross-subdomain sharing
const createCookieStorage = () => {
  const STORAGE_KEY = 'deepvortex-shared-auth'
  const DOMAIN = '.deepvortexai.art'
  
  return {
    getItem: (key: string): string | null => {
      if (typeof document === 'undefined') return null
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name, ...rest] = cookie.trim().split('=')
        if (name === `${STORAGE_KEY}-${key}`) {
          return decodeURIComponent(rest.join('='))
        }
      }
      // Fallback to localStorage for existing sessions
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    },
    setItem: (key: string, value: string): void => {
      if (typeof document === 'undefined') return
      const encodedValue = encodeURIComponent(value)
      document.cookie = `${STORAGE_KEY}-${key}=${encodedValue}; path=/; domain=${DOMAIN}; max-age=31536000; samesite=lax; secure`
      // Also set in localStorage as backup
      try {
        localStorage.setItem(key, value)
      } catch {
        // Ignore localStorage errors
      }
    },
    removeItem: (key: string): void => {
      if (typeof document === 'undefined') return
      document.cookie = `${STORAGE_KEY}-${key}=; path=/; domain=${DOMAIN}; max-age=0; samesite=lax; secure`
      try {
        localStorage.removeItem(key)
      } catch {
        // Ignore localStorage errors
      }
    },
  }
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'deepvortex-shared-auth',
    storage: createCookieStorage(),
  }
})

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  credits: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  pack_name: string
  amount_cents: number
  credits_purchased: number
  status: string
  created_at: string
}
