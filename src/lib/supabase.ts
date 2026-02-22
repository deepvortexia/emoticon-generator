// src/lib/supabase.ts  (App Emoticons — Vite/React)
// Session partagée via cookies sur .deepvortexai.art

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing.')
}

const DOMAIN = '.deepvortexai.art'

// ✅ FIX: Pas de préfixe custom — Supabase passe déjà la clé complète
// Ne pas doubler le préfixe avec STORAGE_KEY
const createCookieStorage = () => {
  return {
    getItem: (key: string): string | null => {
      if (typeof document === 'undefined') return null
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name, ...rest] = cookie.trim().split('=')
        if (name.trim() === key) {
          try {
            return decodeURIComponent(rest.join('='))
          } catch {
            return null
          }
        }
      }
      // Fallback localStorage pour les sessions existantes
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    },

    setItem: (key: string, value: string): void => {
      if (typeof document === 'undefined') return
      const encodedValue = encodeURIComponent(value)
      // 7 jours (pas 1 an — plus sécuritaire)
      document.cookie = `${key}=${encodedValue}; path=/; domain=${DOMAIN}; max-age=604800; SameSite=Lax; Secure`
      try {
        localStorage.setItem(key, value)
      } catch { /* ignore */ }
    },

    removeItem: (key: string): void => {
      if (typeof document === 'undefined') return
      document.cookie = `${key}=; path=/; domain=${DOMAIN}; max-age=0; SameSite=Lax; Secure`
      try {
        localStorage.removeItem(key)
      } catch { /* ignore */ }
    },
  }
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'deepvortex-auth',  // ✅ Même clé que toutes les autres apps
    storage: createCookieStorage(),
  },
})

// Types partagés
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
