import { useEffect } from 'react'
import './HowToUse.css'

export function HowToUse() {
  useEffect(() => {
    document.title = 'How to Create Custom AI Emojis | Deep Vortex'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Learn how to generate custom emoticons and make them transparent for Discord and Telegram.')
    }
    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      canonical.setAttribute('href', 'https://emoticons.deepvortexai.art/how-to-use')
    }
    return () => {
      document.title = 'AI Emoticon Generator - Deep Vortex AI | Create Custom AI Emoji Instantly'
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Create stunning custom AI emoticons and emoji from text descriptions in seconds. Professional quality, instant results. Part of the Deep Vortex AI creative ecosystem.')
      }
      if (canonical) {
        canonical.setAttribute('href', 'https://emoticons.deepvortexai.art/')
      }
    }
  }, [])

  return (
    <div className="how-to-use-page">
      <div className="how-to-use-container">

        {/* Logo */}
        <div className="how-to-use-logo-zone">
          <a href="/">
            <img
              src="https://www.deepvortexai.art/logotinyreal.webp"
              alt="Deep Vortex AI Logo"
              className="how-to-use-logo"
            />
          </a>
        </div>

        {/* Heading */}
        <h1 className="how-to-use-title">
          How to Use the Deep Vortex AI Emoticon Generator
        </h1>
        <p className="how-to-use-subtitle">
          Create your perfect custom emoji in three simple steps.
        </p>

        {/* Steps */}
        <div className="how-to-use-steps">

          <div className="how-to-use-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h2 className="step-title">Describe Your Idea</h2>
              <p className="step-desc">
                Type a creative prompt into the text box — for example,{' '}
                <span className="step-example">"A cool ninja panda"</span> or{' '}
                <span className="step-example">"Wizard cat casting spell"</span>.
                The more descriptive you are, the better the result.
              </p>
            </div>
          </div>

          <div className="how-to-use-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h2 className="step-title">Click Generate</h2>
              <p className="step-desc">
                Hit the <span className="step-highlight">Generate</span> button and let the AI do the magic.
                Your custom emoticon is ready in just a few seconds. Download it instantly as a PNG.
              </p>
            </div>
          </div>

          <div className="how-to-use-step how-to-use-step--pro">
            <div className="step-number step-number--pro">💡</div>
            <div className="step-content">
              <h2 className="step-title">Pro Tip: Make It Transparent!</h2>
              <p className="step-desc">
                Want a perfect transparent background for Discord or Telegram?
                Use our{' '}
                <a
                  href="https://bgremover.deepvortexai.art"
                  className="step-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AI Background Remover
                </a>
                {' '}— upload your emoticon, get a clean transparent PNG in seconds.
                This makes your emoji look flawless on any server or chat background.
              </p>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="how-to-use-cta">
          <a href="/" className="how-to-use-back-btn">
            ← Back to Generator
          </a>
        </div>

      </div>
    </div>
  )
}
