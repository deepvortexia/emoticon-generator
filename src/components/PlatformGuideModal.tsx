import { useState, useEffect } from 'react';
import './PlatformGuideModal.css';

interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlatformGuideModal({ isOpen, onClose }: PlatformGuideModalProps) {
  const [activeTab, setActiveTab] = useState('discord');

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const platforms = [
    { id: 'discord', name: 'Discord', icon: '💬' },
    { id: 'slack', name: 'Slack', icon: '💼' },
    { id: 'twitch', name: 'Twitch', icon: '🎮' },
    { id: 'telegram', name: 'Telegram', icon: '✈️' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '📱' },
    { id: 'reddit', name: 'Reddit', icon: '🤖' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
    { id: 'imessage', name: 'iMessage', icon: '📲' },
  ];

  return (
    <div className="platform-guide-modal" onClick={onClose}>
      <div 
        className="platform-guide-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="platform-guide-title"
      >
        {/* Header */}
        <div className="platform-guide-header">
          <div>
            <h2 id="platform-guide-title">📱 Platform Usage Guide</h2>
            <p className="platform-guide-subtitle">How to use your emojis on social platforms</p>
          </div>
          <button
            onClick={onClose}
            className="platform-guide-close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="platform-tabs-wrapper">
          <div className="platform-tabs">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setActiveTab(platform.id)}
                className={`platform-tab ${activeTab === platform.id ? 'active' : ''}`}
              >
                <span className="platform-icon">{platform.icon}</span>
                <span className="platform-name">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="platform-guide-body">
          {activeTab === 'discord' && <DiscordGuide />}
          {activeTab === 'slack' && <SlackGuide />}
          {activeTab === 'twitch' && <TwitchGuide />}
          {activeTab === 'telegram' && <TelegramGuide />}
          {activeTab === 'whatsapp' && <WhatsAppGuide />}
          {activeTab === 'reddit' && <RedditGuide />}
          {activeTab === 'twitter' && <TwitterGuide />}
          {activeTab === 'imessage' && <IMessageGuide />}
        </div>

        {/* Footer */}
        <div className="platform-guide-footer">
          <a
            href="https://github.com/deepvortexia/emoticon-generator/blob/main/USAGE_GUIDE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="platform-guide-link"
          >
            📖 View Full Documentation on GitHub →
          </a>
        </div>
      </div>
    </div>
  );
}

// Individual platform guide components
function DiscordGuide() {
  return (
    <div className="guide-content">
      <div className="guide-header-section">
        <h3>💬 Discord Setup</h3>
        <div className="guide-specs">
          <span>📏 Size: 128x128px</span>
          <span>💾 Max: 256 KB</span>
          <span>📄 Format: PNG</span>
        </div>
      </div>

      <div className="guide-steps">
        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">1</span>
            <h4>Download Your Emoji</h4>
          </div>
          <p className="step-content">
            Click the "📥 Download" button below your generated image and save the PNG file.
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">2</span>
            <h4>Open Server Settings</h4>
          </div>
          <p className="step-content">
            Right-click your Discord server icon → Select "Server Settings" → Navigate to "Emoji" tab.
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">3</span>
            <h4>Upload Your Emoji</h4>
          </div>
          <p className="step-content">
            Click "Upload Emoji" → Select your PNG → Give it a name (e.g., <code>astronautcat</code>) → Click "Save".
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">4</span>
            <h4>Use It!</h4>
          </div>
          <p className="step-content">
            In any channel, type <code>:youremojiname:</code> to use your custom emoji!
          </p>
        </div>
      </div>

      <div className="guide-tip">
        <p>
          💡 <strong>Tip:</strong> Free servers have 50 emoji slots. Boosted servers get up to 250 slots!
        </p>
      </div>
    </div>
  );
}

function SlackGuide() {
  return (
    <div className="guide-content">
      <div className="guide-header-section">
        <h3>💼 Slack Setup</h3>
        <div className="guide-specs">
          <span>📏 Size: 128x128px</span>
          <span>💾 Max: 128 KB</span>
          <span>📄 Format: PNG/GIF</span>
        </div>
      </div>

      <div className="guide-steps">
        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">1</span>
            <h4>Access Workspace Settings</h4>
          </div>
          <p className="step-content">
            Click your workspace name (top left) → "Settings & administration" → "Customize workspace".
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">2</span>
            <h4>Upload Custom Emoji</h4>
          </div>
          <p className="step-content">
            Navigate to "Emoji" tab → Click "Add Custom Emoji" → Upload your PNG → Name it → Save!
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">3</span>
            <h4>Use in Messages</h4>
          </div>
          <p className="step-content">
            Type <code>:youremojiname:</code> or use the emoji picker!
          </p>
        </div>
      </div>

      <div className="guide-tip">
        <p>
          💡 <strong>Tip:</strong> Paid workspaces get unlimited custom emojis!
        </p>
      </div>
    </div>
  );
}

function TwitchGuide() {
  return (
    <div className="guide-content">
      <div className="guide-header-section">
        <h3>🎮 Twitch Setup</h3>
        <div className="guide-specs">
          <span>📏 Sizes: 28x28, 56x56, 112x112px</span>
          <span>💾 Max: 1 MB</span>
          <span>📄 Format: PNG</span>
        </div>
      </div>

      <div className="guide-warning">
        <p>
          ⚠️ <strong>Requirement:</strong> You must be a Twitch Affiliate or Partner to upload custom emotes.
        </p>
      </div>

      <div className="guide-steps">
        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">1</span>
            <h4>Prepare 3 Sizes</h4>
          </div>
          <p className="step-content">
            Resize your emoji to 28x28px, 56x56px, and 112x112px. Use <a href="https://photopea.com" target="_blank" rel="noopener noreferrer">Photopea</a> for free editing.
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">2</span>
            <h4>Upload to Dashboard</h4>
          </div>
          <p className="step-content">
            Go to Creator Dashboard → Settings → Emotes → Upload all 3 sizes → Submit for review (24-48h approval).
          </p>
        </div>
      </div>

      <div className="guide-tip">
        <p>
          💡 <strong>Tip:</strong> Keep designs simple so they're visible at 28x28px!
        </p>
      </div>
    </div>
  );
}

function TelegramGuide() {
  return (
    <div className="guide-content">
      <div className="guide-header-section">
        <h3>✈️ Telegram Setup</h3>
        <div className="guide-specs">
          <span>📏 Size: 512x512px</span>
          <span>💾 Max: 512 KB</span>
          <span>📄 Format: PNG</span>
        </div>
      </div>

      <div className="guide-steps">
        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">1</span>
            <h4>Find @Stickers Bot</h4>
          </div>
          <p className="step-content">
            In Telegram, search for <code>@Stickers</code> and start a conversation.
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">2</span>
            <h4>Create Sticker Pack</h4>
          </div>
          <p className="step-content">
            Send <code>/newpack</code> → Follow instructions → Upload your PNG → Choose an emoji for it.
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">3</span>
            <h4>Publish & Share</h4>
          </div>
          <p className="step-content">
            Send <code>/publish</code> when done → Get your pack link → Share with friends!
          </p>
        </div>
      </div>

      <div className="guide-tip">
        <p>
          💡 <strong>Tip:</strong> You can have up to 120 stickers per pack!
        </p>
      </div>
    </div>
  );
}

function WhatsAppGuide() {
  return (
    <div className="guide-content">
      <div className="guide-header-section">
        <h3>📱 WhatsApp Setup</h3>
        <div className="guide-specs">
          <span>📏 Size: 512x512px</span>
          <span>💾 Max: 100 KB</span>
          <span>📄 Format: PNG/WebP</span>
        </div>
      </div>

      <div className="guide-warning">
        <p>
          ℹ️ <strong>Note:</strong> WhatsApp requires a third-party sticker app.
        </p>
      </div>

      <div className="guide-steps">
        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">1</span>
            <h4>Download Sticker App</h4>
          </div>
          <p className="step-content">
            <strong>iOS:</strong> "Sticker Maker Studio" or "Sticker.ly"<br />
            <strong>Android:</strong> "Personal Stickers" or "Sticker.ly"
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">2</span>
            <h4>Create Pack</h4>
          </div>
          <p className="step-content">
            Open the app → "Create New Pack" → Add your emojis (minimum 3 stickers) → "Add to WhatsApp".
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">3</span>
            <h4>Use in Chats</h4>
          </div>
          <p className="step-content">
            Open WhatsApp → Tap sticker icon → Your pack appears → Send!
          </p>
        </div>
      </div>

      <div className="guide-tip">
        <p>
          💡 <strong>Tip:</strong> Compress images with <a href="https://squoosh.app" target="_blank" rel="noopener noreferrer">Squoosh</a> if over 100 KB!
        </p>
      </div>
    </div>
  );
}

function RedditGuide() {
  return (
    <div className="guide-content">
      <div className="guide-header-section">
        <h3>🤖 Reddit Setup</h3>
        <div className="guide-specs">
          <span>📏 Size: 128x128px</span>
          <span>📄 Format: PNG</span>
        </div>
      </div>

      <div className="guide-warning">
        <p>
          ⚠️ <strong>Requirement:</strong> You must be a subreddit moderator.
        </p>
      </div>

      <div className="guide-steps">
        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">1</span>
            <h4>Access Mod Tools</h4>
          </div>
          <p className="step-content">
            Go to your subreddit → Click "Mod Tools" → Select "Emoji".
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">2</span>
            <h4>Upload Emoji</h4>
          </div>
          <p className="step-content">
            Click "Upload Emoji" → Select PNG → Name it → Save.
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">3</span>
            <h4>Community Use</h4>
          </div>
          <p className="step-content">
            Members can use <code>:emojiname:</code> in posts and comments!
          </p>
        </div>
      </div>

      <div className="guide-tip">
        <p>
          💡 <strong>Tip:</strong> Max 250 emojis per subreddit!
        </p>
      </div>
    </div>
  );
}

function TwitterGuide() {
  return (
    <div className="guide-content">
      <div className="guide-header-section">
        <h3>🐦 Twitter/X Setup</h3>
        <div className="guide-specs">
          <span>💾 Max: 5 MB (PNG)</span>
          <span>📄 Format: PNG/JPEG/GIF</span>
        </div>
      </div>

      <div className="guide-warning">
        <p>
          ℹ️ <strong>Note:</strong> Twitter doesn't support custom emojis, but you can use images!
        </p>
      </div>

      <div className="guide-steps">
        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">1</span>
            <h4>Use as Images</h4>
          </div>
          <p className="step-content">
            Create a tweet → Click image icon → Upload your emoji → Add text → Post!
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">2</span>
            <h4>Save for Quick Access</h4>
          </div>
          <p className="step-content">
            Save your favorite emojis in a folder for easy uploading!
          </p>
        </div>
      </div>

      <div className="guide-tip">
        <p>
          💡 <strong>Tip:</strong> Create visual responses and reaction images!
        </p>
      </div>
    </div>
  );
}

function IMessageGuide() {
  return (
    <div className="guide-content">
      <div className="guide-header-section">
        <h3>📲 iMessage Setup</h3>
        <div className="guide-specs">
          <span>📄 Format: PNG</span>
          <span>📏 Size: Varies by app</span>
        </div>
      </div>

      <div className="guide-warning">
        <p>
          ℹ️ <strong>Note:</strong> Requires third-party sticker apps or Xcode development.
        </p>
      </div>

      <div className="guide-steps">
        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">1</span>
            <h4>Download Sticker App</h4>
          </div>
          <p className="step-content">
            Try "Sticker Drop" or "Sticker Pals" from the App Store.
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">2</span>
            <h4>Import Emojis</h4>
          </div>
          <p className="step-content">
            Open app → Import your downloaded images → Create pack.
          </p>
        </div>

        <div className="guide-step">
          <div className="step-header">
            <span className="step-number">3</span>
            <h4>Use in iMessage</h4>
          </div>
          <p className="step-content">
            Open Messages → Tap App Store icon → Select your sticker app → Send!
          </p>
        </div>
      </div>

      <div className="guide-tip">
        <p>
          💡 <strong>Tip:</strong> Advanced users can create sticker packs with Xcode!
        </p>
      </div>
    </div>
  );
}
