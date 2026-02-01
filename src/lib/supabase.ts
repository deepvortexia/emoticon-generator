import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
}

// Safe localStorage wrapper for SSR compatibility
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key)
    }
    return null
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value)
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key)
    }
  },
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'emoticon-generator-auth',
    storage: safeStorage,
    flowType: 'pkce',
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
