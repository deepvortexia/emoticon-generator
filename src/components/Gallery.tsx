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
                <img src={item.imageUrl} alt={item.prompt} />
                <div className="gallery-item-info">
                  <p className="gallery-prompt">{item.prompt}</p>
                  <p className="gallery-date">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
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
