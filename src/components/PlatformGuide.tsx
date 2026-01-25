import { useState } from 'react';
import './PlatformGuide.css';

interface Platform {
  id: string;
  name: string;
  icon: string;
}

interface PlatformGuideContent {
  title: string;
  requirements: string[];
  steps: string[];
  limits: string[];
  tip: string;
}

const PLATFORMS: Platform[] = [
  { id: 'discord', name: 'Discord', icon: '💬' },
  { id: 'slack', name: 'Slack', icon: '💼' },
  { id: 'twitch', name: 'Twitch', icon: '🎮' },
  { id: 'telegram', name: 'Telegram', icon: '✈️' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '📱' },
  { id: 'reddit', name: 'Reddit', icon: '🤖' },
  { id: 'twitter', name: 'Twitter', icon: '🐦' },
  { id: 'imessage', name: 'iMessage', icon: '📲' },
];

const PLATFORM_GUIDES: Record<string, PlatformGuideContent> = {
  discord: {
    title: '💬 Discord',
    requirements: [
      'Server owner or "Manage Emojis" permission',
      'PNG format (our emojis are perfect!)',
      'Max file size: 256 KB',
      'Recommended: 128x128px'
    ],
    steps: [
      'Download your emoji (click Download button above)',
      'Right-click Discord server → "Server Settings"',
      'Click "Emoji" → "Upload Emoji"',
      'Select your PNG file',
      'Name it (e.g., "astronautcat")',
      'Use it: type :astronautcat: in any channel!'
    ],
    limits: [
      'Free Server: 50 emojis',
      'Boosted Server: Up to 250 emojis'
    ],
    tip: 'Our emojis are ~50-150 KB - perfect for Discord!'
  },
  slack: {
    title: '💼 Slack',
    requirements: [
      'Workspace admin or emoji permission',
      'PNG or GIF format',
      'Max file size: 128 KB (auto-compressed)',
      'Recommended: 128x128px'
    ],
    steps: [
      'Download your emoji',
      'Click workspace name → "Settings & administration"',
      'Choose "Customize workspace"',
      'Click "Emoji" → "Add Custom Emoji"',
      'Upload PNG and name it',
      'Use it: type :youremojiname: in messages!'
    ],
    limits: [
      'Free Workspace: Limited emojis',
      'Paid Workspace: Unlimited emojis'
    ],
    tip: 'Name consistently: rocket_purple, rocket_blue'
  },
  twitch: {
    title: '🎮 Twitch',
    requirements: [
      'Twitch Affiliate or Partner status',
      'PNG with transparent background',
      'Three sizes: 28x28, 56x56, 112x112px',
      'Max 1 MB per file'
    ],
    steps: [
      'Download emoji and resize to 3 sizes (use Photopea)',
      'Go to twitch.tv/dashboard',
      'Navigate to Settings → Emotes',
      'Upload all three sizes',
      'Name your emote (6-25 characters)',
      'Submit for review (24-48 hours approval)'
    ],
    limits: [
      'Affiliate: 1 emote per tier (5 total)',
      'Partner: 5 emotes per tier + more'
    ],
    tip: 'Test visibility at 28x28px - keep it simple!'
  },
  telegram: {
    title: '✈️ Telegram',
    requirements: [
      'PNG with transparency',
      'Size: 512x512px',
      'Max file size: 512 KB'
    ],
    steps: [
      'Download your emoji',
      'Open Telegram and search @Stickers bot',
      'Send /newpack command',
      'Choose pack name',
      'Send your PNG image',
      'Send emoji that represents it (e.g., 🚀)',
      'Send /publish to finish',
      'Share your pack link!'
    ],
    limits: [
      'Max 120 stickers per pack',
      'File size: 512 KB max'
    ],
    tip: 'Create themed packs for best organization!'
  },
  whatsapp: {
    title: '📱 WhatsApp',
    requirements: [
      'Third-party sticker app needed',
      'PNG or WebP format',
      'Size: 512x512px',
      'Max file size: 100 KB'
    ],
    steps: [
      'Download sticker app (iOS: Sticker Maker Studio, Android: Sticker.ly)',
      'Open app → Create New Pack',
      'Add your downloaded emoji (min 3 stickers)',
      'Tap "Add to WhatsApp"',
      'Open WhatsApp',
      'Tap sticker icon in chat',
      'Your pack appears - start using!'
    ],
    limits: [
      'Min 3, max 30 stickers per pack',
      'Max 100 KB per sticker'
    ],
    tip: 'Compress with Squoosh if over 100 KB'
  },
  reddit: {
    title: '🤖 Reddit',
    requirements: [
      'Must be subreddit moderator',
      'PNG format',
      'Recommended: 128x128px'
    ],
    steps: [
      'Download your emoji',
      'Go to your subreddit',
      'Click Mod Tools → Emoji',
      'Upload Emoji',
      'Name it and set permissions',
      'Members use :emojiname: in comments!'
    ],
    limits: [
      'Max 250 emojis per subreddit',
      'Moderators only can upload'
    ],
    tip: 'Great for building subreddit community identity!'
  },
  twitter: {
    title: '🐦 Twitter/X',
    requirements: [
      'PNG, JPEG, or GIF',
      'Max file size: 5 MB'
    ],
    steps: [
      'Download your emoji',
      'Create tweet or reply',
      'Click image icon',
      'Upload your emoji PNG',
      'Add text and post!'
    ],
    limits: [
      'Max 4 images per tweet',
      'No custom emoji feature (use as images)'
    ],
    tip: 'Create reaction image collections!'
  },
  imessage: {
    title: '📲 iMessage',
    requirements: [
      'Third-party app or Xcode',
      'PNG with transparency',
      'Size varies by app'
    ],
    steps: [
      'Download sticker app (Sticker Drop, Sticker Pals)',
      'Import your emojis into app',
      'Create sticker pack',
      'Open iMessage',
      'Tap App Store icon',
      'Find your sticker pack',
      'Send stickers!'
    ],
    limits: [
      'Varies by app',
      'iOS 10+ required'
    ],
    tip: 'Third-party apps are easier than building from scratch'
  }
};

interface PlatformGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlatformGuide({ isOpen, onClose }: PlatformGuideProps) {
  const [selectedPlatform, setSelectedPlatform] = useState('discord');

  if (!isOpen) {
    return (
      <button className="platform-guide-toggle" onClick={onClose}>
        📱 Platform Guide
      </button>
    );
  }

  const guide = PLATFORM_GUIDES[selectedPlatform];

  return (
    <div className="platform-modal-overlay" onClick={onClose}>
      <div className="platform-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="platform-modal-header">
          <div className="platform-header-content">
            <div>
              <h2 className="platform-title">📱 How to Use Your Emojis</h2>
              <p className="platform-subtitle">Choose your platform for step-by-step instructions</p>
            </div>
            <button onClick={onClose} className="platform-close" aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="platform-tabs">
          {PLATFORMS.map(platform => (
            <button
              key={platform.id}
              className={`platform-tab ${selectedPlatform === platform.id ? 'active' : ''}`}
              onClick={() => setSelectedPlatform(platform.id)}
              aria-label={`View ${platform.name} guide`}
            >
              <span className="tab-icon">{platform.icon}</span>
              <span className="tab-name">{platform.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="platform-content">
          <h3 className="platform-guide-title">{guide.title}</h3>

          {/* Requirements */}
          <div className="platform-section">
            <h4 className="section-heading">Requirements:</h4>
            <ul className="section-list">
              {guide.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="platform-section">
            <h4 className="section-heading">Steps:</h4>
            <ol className="section-list section-list-ordered">
              {guide.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Limits */}
          <div className="platform-section">
            <h4 className="section-heading">Limits:</h4>
            <ul className="section-list">
              {guide.limits.map((limit, i) => (
                <li key={i}>{limit}</li>
              ))}
            </ul>
          </div>

          {/* Tip */}
          <div className="tip-box">
            <span className="tip-icon">💡</span>
            <span className="tip-text">{guide.tip}</span>
          </div>

          {/* Link to full guide */}
          <div className="full-guide-container">
            <a 
              href="https://github.com/deepvortexia/emoticon-generator/blob/main/USAGE_GUIDE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="full-guide-link"
            >
              📖 View Complete Platform Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
