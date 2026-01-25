import { useState } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const generateEmoticon = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description!')
      return
    }

    setIsLoading(true)
    setError('')
    setGeneratedImage('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Create a cute emoticon style illustration of: ${prompt}. Style: cartoon, emoji-like, expressive, simple, colorful`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate emoticon')
      }

      setGeneratedImage(data.image)
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
    <div className="app">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      <div className="container">
        <div className="header">
          <div className="logo">✨</div>
          <h1 className="title">
            <span className="gradient-text">Emoticon Generator</span>
          </h1>
          <p className="subtitle">Create magical emoticons with AI ✨</p>
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
                <span>Generate</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {isLoading && (
          <div className="loading-container">
            <div className="cosmic-loader">
              <div className="planet"></div>
              <div className="orbit"></div>
            </div>
            <p className="loading-text">Creating your magical emoticon...</p>
          </div>
        )}

        {generatedImage && !isLoading && (
          <div className="result-section">
            <h3 className="result-title">Your Emoticon ✨</h3>
            <div className="emoticon-card">
              <img
                src={generatedImage}
                alt={prompt}
                className="emoticon-image"
              />
            </div>
            <p className="prompt-display">"{prompt}"</p>

            <div className="action-buttons">
              <button className="action-btn download-btn" onClick={downloadImage}>
                <span className="btn-icon">⬇️</span>
                Download
              </button>
              <button
                className="action-btn copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(generatedImage)
                  alert('Image URL copied!')
                }}
              >
                <span className="btn-icon">🔗</span>
                Copy URL
              </button>
              <button
                className="action-btn new-btn"
                onClick={() => {
                  setPrompt('')
                  setGeneratedImage('')
                  setError('')
                }}
              >
                <span className="btn-icon">🔄</span>
                New
              </button>
            </div>
          </div>
        )}

        <footer className="footer">
          <p className="footer-text">
            Powered by <span className="gradient-text">OpenAI DALL-E</span> •
            Made with <span className="heart">❤️</span> by{' '}
            <span className="gradient-text">AphoraPixel</span>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
