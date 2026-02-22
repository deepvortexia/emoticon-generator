import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      await supabase.auth.getSession()
      window.location.href = '/'
    }
    handleCallback()
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0a0a0a', color: '#D4AF37',
      fontFamily: 'Orbitron, sans-serif', flexDirection: 'column', gap: '1rem'
    }}>
      <div style={{ fontSize: '2rem' }}>⚡</div>
      <p>Connexion en cours...</p>
    </div>
  )
}
