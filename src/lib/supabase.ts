import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration missing.')
}

// Cookie partagé cross-domaine — même clé sur les 3 sites
const customCookieStorage = {
    getItem: (key: string) => {
          if (typeof document === 'undefined') return null;
          const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
          return match ? decodeURIComponent(match[2]) : null;
    },
    setItem: (key: string, value: string) => {
          if (typeof document === 'undefined') return;
          document.cookie = `${key}=${encodeURIComponent(value)}; domain=.deepvortexai.art; path=/; max-age=31536000; secure; samesite=lax`;
    },
    removeItem: (key: string) => {
          if (typeof document === 'undefined') return;
          document.cookie = `${key}=; domain=.deepvortexai.art; path=/; max-age=0; secure; samesite=lax`;
    }
};

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          storageKey: 'deepvortex-auth',
          storage: customCookieStorage,
    },
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
