import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration missing.')
}

// Helper to get cookie value
const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
}

// Helper to set cookie with cross-domain support
const setCookie = (name: string, value: string, maxAge: number = 31536000) => {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=${encodeURIComponent(value)}; domain=.deepvortexai.art; path=/; max-age=${maxAge}; secure; samesite=lax`
}

// Helper to remove cookie
const removeCookie = (name: string) => {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=; domain=.deepvortexai.art; path=/; max-age=0; secure; samesite=lax`
}

// FIXED: Proper storage implementation that handles PKCE code_verifier correctly
const customCookieStorage = {
    getItem: (key: string): string | null => {
        const value = getCookie(key)
        if (key.includes('code-verifier')) {
            console.log(`[Emoticon Auth] Getting ${key}:`, value ? 'found' : 'not found')
        }
        return value
    },
    setItem: (key: string, value: string): void => {
        if (key.includes('code-verifier')) {
            console.log(`[Emoticon Auth] Setting ${key}`)
        }
        setCookie(key, value)
    },
    removeItem: (key: string): void => {
        if (key.includes('code-verifier')) {
            console.log(`[Emoticon Auth] Removing ${key}`)
        }
        removeCookie(key)
    }
}

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
