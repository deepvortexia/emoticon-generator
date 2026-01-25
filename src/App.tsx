import { useState, useEffect } from 'react'
import './App.css'
import { Gallery } from './components/Gallery'
import { PlatformGuide } from './components/PlatformGuide'

const loadingMessages = [
  "Creating magic... ✨",
  "Brewing pixels... 🎨",
  "Summoning AI spirits... 🌀",
  "Crafting your emoji... 🔮",
  "Mixing colors... 🎭",
  "Generating awesomeness... 🚀"
];

const surprisePrompts = [
  "happy cat", "pizza", "rocket", "rainbow", "unicorn",
  "robot dancing", "dragon with crown", "astronaut dog",
  "ninja turtle", "wizard hat", "magic wand", "crystal ball"
];

// Maximum images that can be generated with $2 credit
const MAX_IMAGES_WITH_CREDIT = 660;

function App() {
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0])
  const [imagesGenerated, setImagesGenerated] = useState(0)
  const [isPlatformGuideOpen, setIsPlatformGuideOpen] = useState(false)

  useEffect(() => {
    // Mark as loaded after initial render
    setIsLoaded(true)
    
    // Load images generated counter
    const count = parseInt(localStorage.getItem('images-generated') || '0', 10)
    setImagesGenerated(count)
  }, [])

  const generateEmoticon = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description!')
      return
    }

    setIsLoading(true)
    setError('')
    setGeneratedImage('')
    setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)])

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate emoticon')
      }

      setGeneratedImage(data.image)
      
      // Save to history
      saveToHistory(prompt, data.image)
      
      // Update counter
      const newCount = imagesGenerated + 1
      setImagesGenerated(newCount)
      localStorage.setItem('images-generated', newCount.toString())
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      generateEmoticon()
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

  const surpriseMe = () => {
    const random = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)]
    setPrompt(random)
  }

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
      <Gallery />
      <PlatformGuide 
        isOpen={isPlatformGuideOpen}
        onClose={() => setIsPlatformGuideOpen(!isPlatformGuideOpen)}
      />
      
      <div className="container">
        <div className="header">
          <div className="logo">🌀</div>
          <h1 className="title title-glow">
            <span className="gradient-text">Deep Vortex</span>
          </h1>
          <p className="subtitle">AI-Powered Emoticon Generator</p>
          
          <div className="credit-counter">
            <span>🎨 Generated: {imagesGenerated}</span>
            <span className="credit-separator">•</span>
            <span>💰 Remaining: ~{MAX_IMAGES_WITH_CREDIT - imagesGenerated} images</span>
          </div>
        </div>

        <div className="examples-section">
          <h3>✨ Try these prompts:</h3>
          
          <div className="example-category">
            <span className="category-label">Simple Emojis (Flat):</span>
            <div className="example-buttons">
              <button onClick={() => setPrompt("pizza")}>🍕 pizza</button>
              <button onClick={() => setPrompt("rocket")}>🚀 rocket</button>
              <button onClick={() => setPrompt("heart")}>❤️ heart</button>
              <button onClick={() => setPrompt("happy face")}>😊 happy face</button>
              <button onClick={() => setPrompt("star")}>⭐ star</button>
              <button onClick={() => setPrompt("coffee cup")}>☕ coffee cup</button>
            </div>
          </div>
          
          <div className="example-category">
            <span className="category-label">Creative Stickers:</span>
            <div className="example-buttons">
              <button onClick={() => setPrompt("astronaut cat in space")}>🐱 astronaut cat</button>
              <button onClick={() => setPrompt("robot dancing with headphones")}>🤖 robot dancing</button>
              <button onClick={() => setPrompt("dragon wearing sunglasses")}>🐉 dragon with sunglasses</button>
              <button onClick={() => setPrompt("cat playing guitar")}>🎸 cat musician</button>
            </div>
          </div>
        </div>

        <div className="input-section">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Describe your emoticon (e.g., happy cosmic cat, mystical star...)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={generateEmoticon}
            disabled={isLoading || !prompt.trim()}
            className="generate-btn"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span className="btn-icon">🎨</span>
                <span>Generate Emoticon</span>
              </>
            )}
          </button>
          
          <button
            onClick={surpriseMe}
            disabled={isLoading}
            className="surprise-btn"
          >
            🎲 Surprise Me!
          </button>
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
          </div>
        )}

        <footer className="footer">
          <p className="footer-text">
            Powered by <span className="gradient-text">Deep Vortex</span> ×{' '}
            <span className="gradient-text">SDXL Emoji</span>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
