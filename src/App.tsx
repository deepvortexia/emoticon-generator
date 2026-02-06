import { useState, useEffect, useRef } from 'react'
import './App.css'
import { Gallery } from './components/Gallery'
import PlatformGuideModal from './components/PlatformGuideModal'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthModal } from './components/AuthModal'
import { PricingModal } from './components/PricingModal'
import { Notification } from './components/Notification'
import { useCredits } from './hooks/useCredits'

const loadingMessages = [
  "Creating magic... ✨",
  "Brewing pixels... 🎨",
  "Summoning AI spirits... 🌀",
  "Crafting your emoji... 🔮",
  "Mixing colors... 🎭",
  "Generating awesomeness... 🚀"
];

// Removed for cleaner design - prompts are now chips
// const surprisePrompts = [
//   "happy cat", "pizza", "rocket", "rainbow", "unicorn",
//   "robot dancing", "dragon with crown", "astronaut dog",
//   "ninja turtle", "wizard hat", "magic wand", "crystal ball"
// ];

// Mobile suggestions (8 items - 4 rows of 2)
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

// Popular styles for desktop
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

// Quick ideas for desktop
const quickIdeas = [
  { emoji: '🍕', text: 'pizza' },
  { emoji: '🚀', text: 'rocket' },
  { emoji: '❤️', text: 'heart' },
  { emoji: '⭐', text: 'star' },
  { emoji: '☕', text: 'coffee' },
  { emoji: '🐱', text: 'cat' },
  { emoji: '🎮', text: 'gaming' },
  { emoji: '🌙', text: 'moon' }
];

// Error message for credit refresh failures
const CREDIT_REFRESH_ERROR = 'Payment successful, but there was a temporary issue syncing your credits. Please refresh the page to see your updated balance.'

// LocalStorage key for pending Stripe sessions
const PENDING_STRIPE_SESSION_KEY = 'pending_stripe_session'

// Future routes structure - Ready for expansion:
// /emoticons or / - Current emoticon generator (default)
// /chat - AI chat interface (coming soon)
// /images - Image generation tool (coming soon)
// /music - Music generation tool (coming soon)
// /tools - Overview of all available tools
// /pricing - Unified pricing for all tools

// Helper to clean URL parameters
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
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  
  const { user, session, loading, profile } = useAuth()
  const { hasCredits, refreshProfile } = useCredits()

  // Refs to track if Stripe sessions have been processed
  const processedSessionIdRef = useRef<string | null>(null)
  const processedPendingSessionRef = useRef(false)

  useEffect(() => {
    // Mark as loaded after initial render
    setIsLoaded(true)
    
    // Load images generated counter
    const count = parseInt(localStorage.getItem('images-generated') || '0', 10)
    setImagesGenerated(count)
  }, [])

  // Handle Stripe return with session_id
  useEffect(() => {
    const handleStripeReturn = async () => {
      const params = new URLSearchParams(window.location.search)
      const sessionId = params.get('session_id')
      
      if (!sessionId) return
      
      // Skip if this session_id has already been processed
      if (processedSessionIdRef.current === sessionId) return
      
      console.log('Stripe session_id detected:', sessionId)
      
      // Wait for auth to finish loading
      if (loading) return
      
      // Mark this session as processed
      processedSessionIdRef.current = sessionId
      
      // If user is logged in, refresh their credits
      if (user) {
        console.log('Stripe payment completed, refreshing credits...')
        try {
          await refreshProfile()
          
          // Show success notification
          setShowNotification(true)
          
          // Clear the URL parameter
          cleanUrlParams()
        } catch (error) {
          console.error('Failed to refresh credits after payment:', error)
          setError(CREDIT_REFRESH_ERROR)
        }
      } else {
        // User not logged in after Stripe return - they need to sign in again
        // Store session_id in localStorage to process after login
        localStorage.setItem(PENDING_STRIPE_SESSION_KEY, sessionId)
        console.log('User not authenticated, stored session_id for later')
        
        // Clear the URL parameter
        cleanUrlParams()
      }
    }
    
    handleStripeReturn()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshProfile is stable from useCredits hook
  }, [loading, user])

  // Check for pending Stripe session after login
  useEffect(() => {
    const processPendingStripeSession = async () => {
      // Reset the processed flag when user logs out
      if (!user) {
        processedPendingSessionRef.current = false
        return
      }
      
      // Skip if we've already processed a pending session for this user
      if (processedPendingSessionRef.current) return
      
      const pendingSession = localStorage.getItem(PENDING_STRIPE_SESSION_KEY)
      if (pendingSession) {
        console.log('Processing pending Stripe session...')
        
        // Mark as processed before async operation
        processedPendingSessionRef.current = true
        
        try {
          await refreshProfile()
          localStorage.removeItem(PENDING_STRIPE_SESSION_KEY)
          
          // Show success message
          setShowNotification(true)
        } catch (error) {
          console.error('Failed to refresh credits for pending session:', error)
          // Reset the flag so it can be retried
          processedPendingSessionRef.current = false
          setError(CREDIT_REFRESH_ERROR)
        }
      }
    }
    
    processPendingStripeSession()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshProfile is stable from useCredits hook
  }, [user])

  const generateEmoticon = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description!')
      return
    }

    // Check if user is logged in
    if (!user) {
      setError('Please sign in to generate emoticons')
      setIsAuthModalOpen(true)
      return
    }

    // Check if user has credits
    if (!hasCredits) {
      setError('You have run out of credits. Please purchase more to continue.')
      setIsPricingModalOpen(true)
      return
    }

    setIsLoading(true)
    setError('')
    setGeneratedImage('')
    setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)])

    try {
      // Get the auth token
      const token = session?.access_token
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // If insufficient credits, show pricing modal
        if (response.status === 402) {
          setIsPricingModalOpen(true)
        }
        throw new Error(data.error || 'Failed to generate emoticon')
      }

      setGeneratedImage(data.image)
      
      // Save to history
      saveToHistory(prompt, data.image)
      
      // Update counter
      const newCount = imagesGenerated + 1
      setImagesGenerated(newCount)
      localStorage.setItem('images-generated', newCount.toString())
      
      // Refresh credits after successful generation
      await refreshProfile()
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const saveToHistory = (prompt: string, imageUrl: string) => {
    try {
      const history = JSON.parse(localStorage.getItem('emoji-history') || '[]')
      const timestamp = Date.now()
      const newItem = {
        id: timestamp.toString(),
        prompt,
        imageUrl,
        timestamp
      }
      
      // Keep only last 20 items
      const updated = [newItem, ...history].slice(0, 20)
      localStorage.setItem('emoji-history', JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving to history:', error)
    }
  }

  const regenerate = async () => {
    if (!prompt) return
    await generateEmoticon()
  }

  // Removed surprise button for cleaner design
  // const surpriseMe = () => {
  //   const random = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)]
  //   setPrompt(random)
  // }

  const downloadImage = async () => {
    if (!generatedImage) return

    try {
      // Use our API proxy to download the image
      const proxyUrl = `/api/download?url=${encodeURIComponent(generatedImage)}`
      
      const link = document.createElement('a')
      link.href = proxyUrl
      link.download = `emoticon-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download image. Please try right-clicking and "Save Image As..."')
    }
  }

  return (
    <div className={`app ${isLoaded ? 'fade-in' : ''}`}>
      {/* App Header - Minimal & Magical */}
      <header className="app-header">
        <div className="logo-container-magic">
          {/* Magic effects wrapper around logo */}
          <div className="magic-effects-wrapper">
            {/* Pulsing glow aura */}
            <div className="magic-glow"></div>
            
            {/* Rotating magic circles */}
            <div className="magic-circles">
              <div className="circle circle-1"></div>
              <div className="circle circle-2"></div>
              <div className="circle circle-3"></div>
            </div>
            
            {/* Floating particles */}
            <div className="magic-particles">
              <div className="magic-particle"></div>
              <div className="magic-particle"></div>
              <div className="magic-particle"></div>
              <div className="magic-particle"></div>
              <div className="magic-particle"></div>
              <div className="magic-particle"></div>
              <div className="magic-particle"></div>
              <div className="magic-particle"></div>
              <div className="magic-particle"></div>
              <div className="magic-particle"></div>
              <div className="magic-particle"></div>
              <div className="magic-particle"></div>
            </div>
            
            {/* Logo in center */}
            <img 
              src="/deepgoldremoveetiny.png" 
              alt="Deep Vortex Logo" 
              className="app-logo-large"
              aria-label="Deep Vortex AI - Emoticon Generator"
            />
          </div>
          
          {/* Brand text below logo */}
          <h1 className="brand-text-orbitron">DΞΞP VORTΞX AI</h1>
          
          {/* Short description */}
          <p className="brand-description">
            Your AI Tools Ecosystem
            <span className="brand-subdescription" aria-label="Current and upcoming features">
              <br />Start with Emoticons • Chat &amp; Images Coming Soon
            </span>
          </p>
        </div>
      </header>
      
      {/* Action Buttons Section */}
      <div className="action-buttons-section">
        <button 
          className="action-btn action-btn-signin"
          onClick={() => setIsAuthModalOpen(true)}
        >
          <span className="btn-icon" aria-hidden="true">🔒</span>
          <span>Sign In</span>
        </button>
        <button 
          className="action-btn action-btn-favorites"
          onClick={() => setIsGalleryOpen(true)}
        >
          <span className="btn-icon" aria-hidden="true">⭐</span>
          <span>Favorites</span>
        </button>
      </div>
      
      {/* Coming Soon Tools Preview */}
      <div className="tools-preview-section" role="region" aria-label="Available and upcoming AI tools">
        <h3 className="tools-preview-title">Complete AI Ecosystem</h3>
        <div className="tools-preview-grid" role="list">
          <div className="tool-card tool-card-active" role="listitem">
            <span className="tool-icon" aria-hidden="true">😀</span>
            <span className="tool-name">Emoticons</span>
            <span className="tool-status" aria-label="Currently available">Available Now</span>
          </div>
          
          <div className="tool-card tool-card-soon" role="listitem">
            <span className="tool-icon" aria-hidden="true">💬</span>
            <span className="tool-name">AI Chat</span>
            <span className="tool-status" aria-label="Coming in the future">Coming Soon</span>
          </div>
          
          <div className="tool-card tool-card-soon" role="listitem">
            <span className="tool-icon" aria-hidden="true">🖼️</span>
            <span className="tool-name">Image Gen</span>
            <span className="tool-status" aria-label="Coming in the future">Coming Soon</span>
          </div>
          
          <div className="tool-card tool-card-soon" role="listitem">
            <span className="tool-icon" aria-hidden="true">✨</span>
            <span className="tool-name">More Tools</span>
            <span className="tool-status" aria-label="Currently in development">In Development</span>
          </div>
        </div>
      </div>
      
      {/* Credits Display Section - Positioned after tools */}
      {user && profile && (
        <div className="credits-display-section">
          <div className="credits-display-content">
            <div className="credits-info">
              <span className="credits-icon">💰</span>
              <span className="credits-amount">{profile.credits || 0} credits</span>
            </div>
            
            <div className="credits-actions">
              <button 
                className="buy-credits-btn"
                onClick={() => setIsPricingModalOpen(true)}
                aria-label="Buy more credits"
              >
                <span aria-hidden="true">💳</span>
                <span>Buy Credits</span>
              </button>
              
              {profile.avatar_url && (
                <img 
                  src={profile.avatar_url} 
                  alt={`${profile.full_name || 'User'} avatar`}
                  className="user-avatar-small"
                />
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Compact Suggestions Section - Different layout for mobile */}
      <div className="suggestions-compact-section">
        {/* Desktop: Show both rows */}
        <div className="suggestion-row suggestion-row-desktop">
          <h4 className="suggestion-row-title">🔥 Popular Styles</h4>
          <div className="suggestion-tags-compact">
            {popularStyles.map((item) => (
              <button
                key={item.text}
                className="suggestion-tag-compact"
                onClick={() => setPrompt(`${item.emoji} ${item.text}`)}
                aria-label={`Quick suggestion: ${item.text}`}
              >
                <span className="tag-emoji" aria-hidden="true">{item.emoji}</span>
                <span className="tag-text">{item.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="suggestion-row suggestion-row-desktop">
          <h4 className="suggestion-row-title">💡 Quick Ideas</h4>
          <div className="suggestion-tags-compact">
            {quickIdeas.map((item) => (
              <button
                key={item.text}
                className="suggestion-tag-compact"
                onClick={() => setPrompt(`${item.emoji} ${item.text}`)}
                aria-label={`Quick suggestion: ${item.text}`}
              >
                <span className="tag-emoji" aria-hidden="true">{item.emoji}</span>
                <span className="tag-text">{item.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: Show only one combined row */}
        <div className="suggestion-row suggestion-row-mobile">
          <h4 className="suggestion-row-title">🔥 Popular</h4>
          <div className="suggestion-tags-compact suggestion-tags-mobile">
            {mobileSuggestions.map((item) => (
              <button
                key={item.text}
                className="suggestion-tag-compact"
                onClick={() => setPrompt(`${item.emoji} ${item.text}`)}
                aria-label={`Quick suggestion: ${item.text}`}
              >
                <span className="tag-emoji" aria-hidden="true">{item.emoji}</span>
                <span className="tag-text">{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <Gallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
      
      {/* Animated Background */}
      <div className="app-container">
        {/* Floating Particles */}
        <div className="particles">
          <div className="particle" style={{ left: '10%', animationDelay: '0s' }}></div>
          <div className="particle" style={{ left: '20%', animationDelay: '2s' }}></div>
          <div className="particle" style={{ left: '30%', animationDelay: '4s' }}></div>
          <div className="particle" style={{ left: '40%', animationDelay: '1s' }}></div>
          <div className="particle" style={{ left: '50%', animationDelay: '3s' }}></div>
          <div className="particle" style={{ left: '60%', animationDelay: '5s' }}></div>
          <div className="particle" style={{ left: '70%', animationDelay: '2.5s' }}></div>
          <div className="particle" style={{ left: '80%', animationDelay: '4.5s' }}></div>
          <div className="particle" style={{ left: '90%', animationDelay: '1.5s' }}></div>
        </div>
      </div>
      
      <div className="main-content">
        {/* Prompt Section - Eye-catching */}
        <div className="prompt-section-wrapper">
          <h3 className="prompt-section-title">
            <span className="title-icon">✨</span>
            Create Your Emoticon
          </h3>
          
          <div className="prompt-input-container">
            <input
              className="prompt-input-enhanced"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your emoticon (e.g., happy cosmic cat)"
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && generateEmoticon()}
              disabled={isLoading}
            />
            
            <button 
              className="generate-btn-enhanced"
              onClick={generateEmoticon}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span className="btn-text">Generating...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">🎨</span>
                  <span className="btn-text">Generate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {isLoading && (
          <div className="loading-section">
            <div className="loading-spinner-large"></div>
            <p className="loading-message">{loadingMessage}</p>
            <p className="loading-hint">This usually takes 3-5 seconds</p>
          </div>
        )}

        {generatedImage && !isLoading && (
          <div className="result-section slide-up">
            <h2 className="result-title">
              Your Emoticon ✨
              <span className="generation-time">Generated in ~4s</span>
            </h2>
            
            <div className="image-container">
              <img
                src={generatedImage}
                alt="Generated emoticon"
                className="generated-image fade-in-image"
                loading="lazy"
                decoding="async"
              />
            </div>
            
            <div className="action-buttons">
              <button onClick={downloadImage} className="action-btn download-btn">
                <span>📥</span> Download
              </button>
              <button onClick={regenerate} className="action-btn regenerate-btn">
                <span>🔄</span> Regenerate
              </button>
              <button
                className="action-btn copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(generatedImage)
                  alert('Image URL copied!')
                }}
              >
                <span>🔗</span> Copy URL
              </button>
            </div>
            
            <button 
              className="platform-guide-button"
              onClick={() => setIsGuideOpen(true)}
            >
              📱 How to Use on Social Platforms
            </button>
          </div>
        )}

        <footer className="footer">
          <p className="footer-tagline">
            Deep Vortex AI - Building the complete AI creative ecosystem
          </p>
          <p className="footer-text">
            Powered by <span className="gradient-text">Deep Vortex</span> ×{' '}
            <span className="gradient-text">SDXL Emoji</span>
          </p>
        </footer>
      </div>
      
      <PlatformGuideModal 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)} 
      />
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      
      <PricingModal 
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
      
      {showNotification && (
        <Notification
          title="Payment Successful!"
          message="Your credits have been added to your account."
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
