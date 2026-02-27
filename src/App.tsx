// src/App.tsx  (Emoticons)
// Seul changement : détecter /auth/callback et afficher AuthCallback

import { useState, useEffect, useRef } from 'react'
import './App.css'
import { Gallery } from './components/Gallery'
import PlatformGuideModal from './components/PlatformGuideModal'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthModal } from './components/AuthModal'
import { PricingModal } from './components/PricingModal'
import { Notification } from './components/Notification'
import { useCredits } from './hooks/useCredits'
import { AuthCallback } from './pages/AuthCallback'  // ← NOUVEAU

const loadingMessages = [
  "Creating magic... ✨",
  "Brewing pixels... 🎨",
  "Summoning AI spirits... 🌀",
  "Crafting your emoji... 🔮",
  "Mixing colors... 🎭",
  "Generating awesomeness... 🚀"
];

const mobileSuggestions = [
  { emoji: '✨', text: 'sparkle' },
  { emoji: '🎨', text: 'neon' },
  { emoji: '🔮', text: 'mystical' },
  { emoji: '⚡', text: 'electric' },
  { emoji: '🍕', text: 'pizza' },
  { emoji: '🚀', text: 'rocket' },
  { emoji: '❤️', text: 'heart' },
  { emoji: '⭐', text: 'star' }
];

const popularStyles = [
  { emoji: '✨', text: 'sparkle' },
  { emoji: '🎨', text: 'neon' },
  { emoji: '🔮', text: 'mystical' },
  { emoji: '⚡', text: 'electric' },
  { emoji: '🌈', text: 'rainbow' },
  { emoji: '💎', text: 'crystal' },
  { emoji: '🌟', text: 'glowing' },
  { emoji: '🔥', text: 'fire' }
];

const quickIdeas = [
  { emoji: '👑', text: 'Happy cat wearing crown' },
  { emoji: '🍕', text: 'Robot eating pizza slice' },
  { emoji: '😎', text: 'Panda with cool sunglasses' },
  { emoji: '☕', text: 'Unicorn drinking hot coffee' },
  { emoji: '🎸', text: 'Ninja playing electric guitar' },
  { emoji: '🚀', text: 'Astronaut riding a rocket' },
  { emoji: '🪄', text: 'Fox wizard with wand' },
  { emoji: '🎩', text: 'Penguin wearing top hat' },
  { emoji: '🎂', text: 'Dragon blowing birthday candles' },
  { emoji: '🧘', text: 'Sloth doing yoga pose' },
  { emoji: '🌌', text: 'Monkey astronaut in space' },
  { emoji: '🍝', text: 'Bunny chef cooking pasta' },
  { emoji: '🦸', text: 'Bear superhero with cape' },
  { emoji: '📖', text: 'Owl reading magic book' },
  { emoji: '🛹', text: 'Dinosaur on skateboard' }
];

const CREDIT_REFRESH_ERROR = 'Payment successful, but there was a temporary issue syncing your credits. Please refresh the page to see your updated balance.'
const PENDING_STRIPE_SESSION_KEY = 'pending_stripe_session'

const cleanUrlParams = () => {
  window.history.replaceState({}, '', window.location.pathname)
}

function AppContent() {
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0])
  const [imagesGenerated, setImagesGenerated] = useState(0)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [toast, setToast] = useState<{title:string;message:string;type:'success'|'error'|'warning'}|null>(null)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  
  const { user, session, loading, profile } = useAuth()
  const { hasCredits, refreshProfile } = useCredits()

  const processedSessionIdRef = useRef<string | null>(null)
  const processedPendingSessionRef = useRef(false)

  useEffect(() => {
    setIsLoaded(true)
    const count = parseInt(localStorage.getItem('images-generated') || '0', 10)
    setImagesGenerated(count)
  }, [])

  useEffect(() => {
    const handleStripeReturn = async () => {
      const params = new URLSearchParams(window.location.search)
      const sessionId = params.get('session_id')
      if (!sessionId) return
      if (processedSessionIdRef.current === sessionId) return
      console.log('Stripe session_id detected:', sessionId)
      if (loading) return
      processedSessionIdRef.current = sessionId
      if (user) {
        try {
          await refreshProfile()
          setShowNotification(true)
          cleanUrlParams()
        } catch (error) {
          console.error('Failed to refresh credits after payment:', error)
          setError(CREDIT_REFRESH_ERROR)
        }
      } else {
        localStorage.setItem(PENDING_STRIPE_SESSION_KEY, sessionId)
        cleanUrlParams()
      }
    }
    handleStripeReturn()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user])

  useEffect(() => {
    const processPendingStripeSession = async () => {
      if (!user) { processedPendingSessionRef.current = false; return }
      if (processedPendingSessionRef.current) return
      const pendingSession = localStorage.getItem(PENDING_STRIPE_SESSION_KEY)
      if (pendingSession) {
        processedPendingSessionRef.current = true
        try {
          await refreshProfile()
          localStorage.removeItem(PENDING_STRIPE_SESSION_KEY)
          setShowNotification(true)
        } catch (error) {
          processedPendingSessionRef.current = false
          setError(CREDIT_REFRESH_ERROR)
        }
      }
    }
    processPendingStripeSession()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const generateEmoticon = async () => {
    if (!prompt.trim()) { setError('Please enter a description!'); return }
    if (!user) { setError('Please sign in to generate emoticons'); setIsAuthModalOpen(true); return }
    if (!hasCredits) { setError('You have run out of credits. Please purchase more to continue.'); setIsPricingModalOpen(true); return }
    setIsLoading(true)
    setError('')
    setToast(null)
    setGeneratedImage('')
    setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)])
    try {
      const token = session?.access_token
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 60000)
      let response: Response
      try {
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        })
      } catch (fetchErr: any) {
        clearTimeout(timeout)
        if (fetchErr.name === 'AbortError') {
          setToast({ title: 'Request Timed Out', message: 'The generation took too long. Please try again. No credits were deducted.', type: 'warning' })
        } else {
          setToast({ title: 'Network Error', message: 'Could not connect to the server. Please check your connection and try again. No credits were deducted.', type: 'error' })
        }
        return
      }
      clearTimeout(timeout)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        switch (response.status) {
          case 401:
            setToast({ title: 'Session Expired', message: 'Your session has expired. Please refresh the page and sign in again. No credits were deducted.', type: 'error' })
            break
          case 402:
            setToast({ title: 'Insufficient Credits', message: "You don't have enough credits. Purchase more to continue generating.", type: 'warning' })
            setIsPricingModalOpen(true)
            break
          case 429:
            setToast({ title: 'Too Many Requests', message: 'Please wait a moment before generating again. No credits were deducted.', type: 'warning' })
            break
          case 503:
            setToast({ title: 'Service Unavailable', message: 'The emoticon generation service is temporarily unavailable. Please try again in a few minutes. No credits were deducted.', type: 'error' })
            break
          default:
            setToast({ title: 'Generation Failed', message: (data.error || 'An unexpected error occurred') + '. No credits were deducted.', type: 'error' })
            break
        }
        return
      }
      const data = await response.json()
      setGeneratedImage(data.image)
      saveToHistory(prompt, data.image)
      const newCount = imagesGenerated + 1
      setImagesGenerated(newCount)
      localStorage.setItem('images-generated', newCount.toString())
      await refreshProfile()
    } catch (err: any) {
      setToast({ title: 'Generation Failed', message: (err.message || 'An unexpected error occurred') + '. No credits were deducted.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const saveToHistory = (prompt: string, imageUrl: string) => {
    try {
      const history = JSON.parse(localStorage.getItem('emoji-history') || '[]')
      const timestamp = Date.now()
      const updated = [{ id: timestamp.toString(), prompt, imageUrl, timestamp }, ...history].slice(0, 20)
      localStorage.setItem('emoji-history', JSON.stringify(updated))
    } catch (error) { console.error('Error saving to history:', error) }
  }

  const regenerate = async () => { if (prompt) await generateEmoticon() }

  const downloadImage = async () => {
    if (!generatedImage) return
    try {
      const link = document.createElement('a')
      link.href = `/api/download?url=${encodeURIComponent(generatedImage)}`
      link.download = `emoticon-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      alert('Failed to download image. Please try right-clicking and "Save Image As..."')
    }
  }

  return (
    <div className={`app ${isLoaded ? 'fade-in' : ''}`}>
      <header className="app-header">
        <a href="https://deepvortexai.art" className="back-to-home-link">
          <span className="back-to-home-text-full">← Back to Home</span>
          <span className="back-to-home-text-short">← Home</span>
        </a>
        <div className="logo-container-magic">
          <div className="magic-effects-wrapper">
            <div className="magic-glow"></div>
            <div className="magic-circles">
              <div className="circle circle-1"></div>
              <div className="circle circle-2"></div>
              <div className="circle circle-3"></div>
            </div>
            <div className="magic-particles">
              {[...Array(6)].map((_, i) => <div key={i} className="magic-particle"></div>)}
            </div>
            <img src="/deepgoldremoveetiny.png" alt="Deep Vortex Logo" className="app-logo-large" />
          </div>
          <h1 className="brand-text-orbitron">DΞΞP VORTΞX AI</h1>
          <p className="brand-description">
            Your AI Tools Ecosystem
            <span className="brand-subdescription"><br />Start with Emoticons • Chat &amp; Images Coming Soon</span>
          </p>
        </div>
      </header>
      
      <div className="action-buttons-section">
        <button className="action-btn action-btn-signin" onClick={() => setIsAuthModalOpen(true)}>
          <span className="btn-icon">🔒</span><span>Sign In</span>
        </button>
        <button className="action-btn action-btn-favorites" onClick={() => setIsGalleryOpen(true)}>
          <span className="btn-icon">⭐</span><span>Favorites</span>
        </button>
      </div>
      
      <div className="tools-preview-section">
        <h3 className="tools-preview-title">Complete AI Ecosystem</h3>
        <div className="tools-preview-grid">
          <div className="tool-card tool-card-active">
            <span className="tool-badge-available">✅ Available</span>
            <span className="tool-icon">😀</span>
            <span className="tool-name">Emoticons</span>
            <span className="tool-button tool-button-current">Current Tool</span>
          </div>
          <div className="tool-card tool-card-soon">
            <span className="tool-icon">🎥</span>
            <span className="tool-name">Video</span>
            <span className="tool-status">Coming Soon</span>
          </div>
          <a href="https://images.deepvortexai.art/" className="tool-card tool-card-link" target="_blank" rel="noopener noreferrer">
            <span className="tool-badge-available">✅ Available</span>
            <span className="tool-icon">🖼️</span>
            <span className="tool-name">Image Gen</span>
            <span className="tool-button tool-button-link">Open Image Gen</span>
          </a>
          <div className="tool-card tool-card-soon">
            <span className="tool-icon">💬</span>
            <span className="tool-name">AI Chat</span>
            <span className="tool-status">Coming Soon</span>
          </div>
          <div className="tool-card tool-card-soon">
            <span className="tool-icon">✨</span>
            <span className="tool-name">More Tools</span>
            <span className="tool-status">In Development</span>
          </div>
        </div>
      </div>

      {user && profile && (
        <div className="credits-display-section">
          <div className="credits-display-content">
            <div className="credits-info">
              <span className="credits-icon">💰</span>
              <span className="credits-amount">{profile.credits || 0} credits</span>
            </div>
            <div className="credits-actions">
              <button className="buy-credits-btn" onClick={() => setIsPricingModalOpen(true)}>
                <span>💳</span><span>Buy Credits</span>
              </button>
              {profile.avatar_url && (
                <img src={profile.avatar_url} alt={`${profile.full_name || 'User'} avatar`} className="user-avatar-small" />
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="suggestions-compact-section">
        <div className="suggestion-row suggestion-row-desktop">
          <h4 className="suggestion-row-title">🔥 Popular Styles</h4>
          <div className="suggestion-tags-compact">
            {popularStyles.map((item) => (
              <button key={item.text} className="suggestion-tag-compact" onClick={() => setPrompt(item.text)}>
                <span className="tag-emoji">{item.emoji}</span><span className="tag-text">{item.text}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="suggestion-row suggestion-row-desktop">
          <h4 className="suggestion-row-title">💡 Quick Ideas</h4>
          <div className="suggestion-tags-compact">
            {quickIdeas.map((item) => (
              <button key={item.text} className="suggestion-tag-compact" onClick={() => setPrompt(item.text)}>
                <span className="tag-emoji">{item.emoji}</span><span className="tag-text">{item.text}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="suggestion-row suggestion-row-mobile">
          <h4 className="suggestion-row-title">🔥 Popular</h4>
          <div className="suggestion-tags-compact suggestion-tags-mobile">
            {mobileSuggestions.map((item) => (
              <button key={item.text} className="suggestion-tag-compact" onClick={() => setPrompt(item.text)}>
                <span className="tag-emoji">{item.emoji}</span><span className="tag-text">{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <Gallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
      
      <div className="app-container">
        <div className="particles">
          {[10,20,30,40,50,60,70,80,90].map((left, i) => (
            <div key={i} className="particle" style={{ left: `${left}%`, animationDelay: `${i * 0.5}s` }}></div>
          ))}
        </div>
      </div>
      
      <div className="main-content">
        <div className="prompt-section-wrapper">
          <h3 className="prompt-section-title"><span className="title-icon">✨</span>Create Your Emoticon</h3>
          <div className="prompt-input-container">
            <input
              className="prompt-input-enhanced"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your emoticon (e.g., happy cosmic cat)"
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && generateEmoticon()}
              disabled={isLoading}
            />
            <button className="generate-btn-enhanced" onClick={generateEmoticon} disabled={isLoading || !prompt.trim()}>
              {isLoading ? (
                <><span className="spinner"></span><span className="btn-text">Generating...</span></>
              ) : (
                <><span className="btn-icon">🎨</span><span className="btn-text">Generate</span></>
              )}
            </button>
          </div>
        </div>

        {error && <div className="error-message"><span className="error-icon">⚠️</span>{error}</div>}

        {isLoading && (
          <div className="loading-section">
            <div className="loading-spinner-large"></div>
            <p className="loading-message">{loadingMessage}</p>
            <p className="loading-hint">This usually takes 3-5 seconds</p>
          </div>
        )}

        {generatedImage && !isLoading && (
          <div className="result-section slide-up">
            <h2 className="result-title">Your Emoticon ✨<span className="generation-time">Generated in ~4s</span></h2>
            <div className="image-container">
              <img src={generatedImage} alt="Generated emoticon" className="generated-image fade-in-image" loading="lazy" />
            </div>
            <div className="action-buttons">
              <button onClick={downloadImage} className="action-btn download-btn"><span>📥</span> Download</button>
              <button onClick={regenerate} className="action-btn regenerate-btn"><span>🔄</span> Regenerate</button>
              <button className="action-btn copy-btn" onClick={() => { navigator.clipboard.writeText(generatedImage); alert('Image URL copied!') }}>
                <span>🔗</span> Copy URL
              </button>
            </div>
            <button className="platform-guide-button" onClick={() => setIsGuideOpen(true)}>📱 How to Use on Social Platforms</button>
          </div>
        )}

        <footer className="footer">
          <p className="footer-tagline">Deep Vortex AI - Building the complete AI creative ecosystem</p>
          <p className="footer-text">Powered by <span className="gradient-text">Deep Vortex</span> × <span className="gradient-text">SDXL Emoticon</span></p>
        </footer>
      </div>
      
      <PlatformGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} />
      {showNotification && (
        <Notification title="Payment Successful!" message="Your credits have been added to your account." onClose={() => setShowNotification(false)} />
      )}
      {toast && (
        <Notification title={toast.title} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}

function App() {
  const path = window.location.pathname
  // ✅ Détecter /auth/callback avant de rendre l'app normale
  if (path === '/auth/callback') {
    return (
      <AuthProvider>
        <AuthCallback />
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
