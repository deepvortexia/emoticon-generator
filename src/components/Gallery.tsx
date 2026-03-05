import { useState, useEffect } from 'react';
import './Gallery.css';

interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
}

interface GalleryProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Gallery({ isOpen: externalIsOpen, onClose: externalOnClose }: GalleryProps = {}) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose ? (value: boolean) => {
    if (!value) externalOnClose();
  } : setInternalIsOpen;

  useEffect(() => {
    const loadHistory = () => {
      try {
        const saved = localStorage.getItem('emoji-history');
        if (saved) {
          setHistory(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading gallery history:', error);
        localStorage.removeItem('emoji-history');
      }
    };
    
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const handleImageError = (id: string) => {
    setBrokenImages(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };
  
  const handleImageLoad = (id: string) => {
    // Remove from broken set if it loads successfully
    setBrokenImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
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

  // Don't render toggle button if controlled externally
  if (!isOpen && externalIsOpen === undefined) {
    return (
      <button className="gallery-toggle" onClick={() => setIsOpen(true)}>
        🖼️ Gallery ({history.length})
      </button>
    );
  }
  
  // Don't render anything if closed and controlled externally
  if (!isOpen) {
    return null;
  }

  return (
    <div className="gallery-modal">
      <div className="gallery-content">
        <div className="gallery-header">
          <h2>🖼️ Your Gallery</h2>
          <button onClick={() => setIsOpen(false)} className="gallery-close">✕</button>
        </div>
        
        <div className="gallery-grid">
          {history.length === 0 ? (
            <p className="gallery-empty">No emojis saved yet!</p>
          ) : (
            history.map((item) => (
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
                  <p className="gallery-date">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  className="gallery-download-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadImage(item.imageUrl, item.prompt, item.id);
                  }}
                  disabled={brokenImages.has(item.id)}
                  title={brokenImages.has(item.id) ? "Image unavailable" : "Download"}
                  aria-label={brokenImages.has(item.id) ? "Image unavailable" : "Download image"}
                >
                  💾
                </button>
              </div>
            ))
          )}
        </div>
        
        {history.length > 0 && (
          <button className="clear-history-btn" onClick={clearHistory}>
            🗑️ Clear History
          </button>
        )}
      </div>
    </div>
  );
}
