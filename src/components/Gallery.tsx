import { useState, useEffect } from 'react';
import './Gallery.css';

interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
}

export function Gallery() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('emoji-history');
      setHistory(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error('Error loading gallery history:', error);
      localStorage.removeItem('emoji-history');
    }
  };

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { if (isOpen) loadHistory(); }, [isOpen]);

  const handleImageError = (id: string) => {
    setBrokenImages(prev => { const s = new Set(prev); s.add(id); return s; });
  };

  const handleImageLoad = (id: string) => {
    setBrokenImages(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const handleDownloadImage = async (imageUrl: string, prompt: string, id: string) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const safePrompt = prompt.replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '-').slice(0, 30)
    const filename = `emoticon-${safePrompt}-${id.slice(0, 8)}.png`
    try {
      const response = await fetch(imageUrl, { mode: 'cors' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      if (isMobile) {
        const file = new File([blob], filename, { type: blob.type })
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file] })
          return
        }
        window.open(imageUrl, '_blank')
        return
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      alert('Download failed. Please try right-clicking and "Save Image As..."')
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('emoji-history');
    setHistory([]);
  };

  return (
    <div className="favorites-wrapper">
      <div className="favorites-btn-row">
        <button
          className={`gallery-toggle${isOpen ? ' gallery-toggle-active' : ''}`}
          onClick={() => setIsOpen(o => !o)}
        >
          ⭐ Gallery{history.length > 0 ? ` (${history.length})` : ''}
        </button>
      </div>
      {isOpen && (
        <section className="favorites-section">
          <h2 className="favorites-heading">⭐ Your Gallery</h2>
          {history.length === 0 ? (
            <p className="favorites-loading">No emoticons saved yet.</p>
          ) : (
            <>
              <div className="gallery-grid">
                {history.map((item) => (
                  <div key={item.id} className="gallery-item">
                    {brokenImages.has(item.id) ? (
                      <div className="image-placeholder-broken">
                        <span className="placeholder-icon">😕</span>
                        <p className="placeholder-text">Image unavailable</p>
                        <p className="placeholder-prompt">{item.prompt}</p>
                      </div>
                    ) : (
                      <img
                        src={item.imageUrl}
                        alt={item.prompt}
                        loading="lazy"
                        decoding="async"
                        onError={() => handleImageError(item.id)}
                        onLoad={() => handleImageLoad(item.id)}
                      />
                    )}
                    <div className="gallery-item-info">
                      <p className="gallery-prompt">{item.prompt}</p>
                      <p className="gallery-date">{new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                    <button
                      className="gallery-download-btn"
                      onClick={(e) => { e.stopPropagation(); handleDownloadImage(item.imageUrl, item.prompt, item.id); }}
                      disabled={brokenImages.has(item.id)}
                      title={brokenImages.has(item.id) ? "Image unavailable" : "Download"}
                      aria-label={brokenImages.has(item.id) ? "Image unavailable" : "Download image"}
                    >💾</button>
                  </div>
                ))}
              </div>
              <button className="clear-history-btn" onClick={clearHistory}>
                🗑️ Clear History
              </button>
            </>
          )}
        </section>
      )}
    </div>
  );
}
