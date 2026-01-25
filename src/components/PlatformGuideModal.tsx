import { useState } from 'react';
import './PlatformGuideModal.css';

interface PlatformRequirements {
  format?: string;
  size?: string;
  sizes?: string;
  maxSize?: string;
  note?: string;
}

interface Platform {
  icon: string;
  name: string;
  steps: string[];
  requirements: PlatformRequirements;
}

interface Platforms {
  [key: string]: Platform;
}

const PLATFORMS: Platforms = {
  discord: {
    icon: '💬',
    name: 'Discord',
    steps: [
      'Download your emoji (PNG)',
      'Right-click server → Server Settings → Emoji',
      'Click "Upload Emoji"',
      'Name it (e.g., astronautcat)',
      'Use with :emojiname:'
    ],
    requirements: {
      format: 'PNG',
      size: '128x128px recommended',
      maxSize: '256 KB',
      note: 'Need "Manage Emojis" permission'
    }
  },
  slack: {
    icon: '💼',
    name: 'Slack',
    steps: [
      'Download your emoji',
      'Click workspace name → Customize workspace',
      'Go to "Emoji" tab',
      'Upload your PNG',
      'Name it (letters, numbers, dashes only)'
    ],
    requirements: {
      format: 'PNG/GIF',
      size: '128x128px',
      maxSize: '128 KB (auto-compressed)'
    }
  },
  telegram: {
    icon: '✈️',
    name: 'Telegram',
    steps: [
      'Download your emoji',
      'Open @Stickers bot in Telegram',
      'Send /newpack',
      'Upload your image',
      'Send emoji that represents it',
      'Send /publish to finalize'
    ],
    requirements: {
      format: 'PNG with transparency',
      size: '512x512px',
      maxSize: '512 KB',
      note: 'Up to 120 stickers per pack'
    }
  },
  whatsapp: {
    icon: '📱',
    name: 'WhatsApp',
    steps: [
      'Download sticker app (iOS: "Sticker Maker Studio", Android: "Sticker.ly")',
      'Create new pack in app',
      'Add your downloaded emojis',
      'Tap "Add to WhatsApp"',
      'Use in chats!'
    ],
    requirements: {
      format: 'PNG/WebP',
      size: '512x512px',
      maxSize: '100 KB',
      note: 'Min 3 stickers per pack'
    }
  },
  twitch: {
    icon: '🎮',
    name: 'Twitch',
    steps: [
      'Download your emoji',
      'Resize to 28px, 56px, 112px (3 versions)',
      'Go to twitch.tv/dashboard',
      'Settings → Emotes',
      'Upload all 3 sizes',
      'Wait for approval (24-48h)'
    ],
    requirements: {
      format: 'PNG with transparency',
      sizes: '28x28, 56x56, 112x112px',
      maxSize: '1 MB',
      note: 'Must be Affiliate/Partner'
    }
  },
  reddit: {
    icon: '🤖',
    name: 'Reddit',
    steps: [
      'Go to your subreddit',
      'Mod Tools → Emoji',
      'Upload Emoji',
      'Name it',
      'Set permissions'
    ],
    requirements: {
      format: 'PNG',
      size: '128x128px',
      note: 'Moderators only, max 250 per subreddit'
    }
  },
  twitter: {
    icon: '🐦',
    name: 'Twitter/X',
    steps: [
      'Download your emoji',
      'Create tweet',
      'Click image icon',
      'Upload your emoji PNG',
      'Tweet!'
    ],
    requirements: {
      maxSize: '5 MB per image',
      note: 'No custom emoji support - use as images in tweets'
    }
  }
};

interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlatformGuideModal({ isOpen, onClose }: PlatformGuideModalProps) {
  const [activeTab, setActiveTab] = useState('discord');

  if (!isOpen) return null;

  const platform = PLATFORMS[activeTab];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📱 How to Use Your Emojis</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="platform-tabs">
          {Object.keys(PLATFORMS).map((key) => (
            <button
              key={key}
              className={`tab ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {PLATFORMS[key].icon} {PLATFORMS[key].name}
            </button>
          ))}
        </div>

        <div className="platform-content">
          <h3>{platform.icon} {platform.name}</h3>
          
          <div className="steps-section">
            <h4>📋 Steps:</h4>
            <ol>
              {platform.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="requirements-section">
            <h4>✅ Requirements:</h4>
            <ul>
              {platform.requirements.format && <li><strong>Format:</strong> {platform.requirements.format}</li>}
              {platform.requirements.size && <li><strong>Size:</strong> {platform.requirements.size}</li>}
              {platform.requirements.sizes && <li><strong>Sizes:</strong> {platform.requirements.sizes}</li>}
              {platform.requirements.maxSize && <li><strong>Max file size:</strong> {platform.requirements.maxSize}</li>}
              {platform.requirements.note && <li><strong>Note:</strong> {platform.requirements.note}</li>}
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <a 
            href="https://github.com/deepvortexia/emoticon-generator/blob/main/USAGE_GUIDE.md" 
            target="_blank" 
            rel="noopener noreferrer"
            className="full-guide-link"
          >
            📖 View Full Detailed Guide →
          </a>
        </div>
      </div>
    </div>
  );
}
