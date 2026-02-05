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

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      // Use our API proxy to download the image
      const proxyUrl = `/api/download?url=${encodeURIComponent(imageUrl)}`;
      
      const link = document.createElement('a');
      link.href = proxyUrl;
      link.download = `${prompt.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download image. Please try right-clicking and "Save Image As..."');
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('emoji-history');
    setHistory([]);
  };

  if (!isOpen) {
    return (
      <button className="gallery-toggle" onClick={() => setIsOpen(true)}>
        🖼️ Gallery ({history.length})
      </button>
    );
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
                <img 
                  src={item.imageUrl} 
                  alt={item.prompt}
                  loading="lazy"
                  decoding="async"
                />
                <div className="gallery-item-info">
                  <p className="gallery-prompt">{item.prompt}</p>
                  <p className="gallery-date">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  className="gallery-download-btn"
                  onClick={() => downloadImage(item.imageUrl, item.prompt)}
                  title="Download"
                >
                  📥
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
