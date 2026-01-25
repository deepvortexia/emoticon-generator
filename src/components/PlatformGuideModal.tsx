import { useState } from 'react';
import './PlatformGuideModal.css';

interface Platform {
  id: string;
  name: string;
  icon: string;
}

const platforms: Platform[] = [
  { id: 'discord', name: 'Discord', icon: '💬' },
  { id: 'slack', name: 'Slack', icon: '💼' },
  { id: 'twitch', name: 'Twitch', icon: '🎮' },
  { id: 'telegram', name: 'Telegram', icon: '✈️' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '📱' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
  { id: 'reddit', name: 'Reddit', icon: '🤖' },
  { id: 'imessage', name: 'iMessage', icon: '📲' },
];

interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlatformGuideModal({ isOpen, onClose }: PlatformGuideModalProps) {
  const [activePlatform, setActivePlatform] = useState('discord');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📱 How to Use Your Emojis</h2>
          <p>Choose your platform for step-by-step instructions</p>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="platform-tabs">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              className={`platform-tab ${activePlatform === platform.id ? 'active' : ''}`}
              onClick={() => setActivePlatform(platform.id)}
            >
              <span className="platform-icon">{platform.icon}</span>
              <span className="platform-name">{platform.name}</span>
            </button>
          ))}
        </div>

        <div className="platform-content">
          <PlatformContent platform={activePlatform} />
        </div>

        <div className="modal-footer">
          <a 
            href="https://github.com/deepvortexia/emoticon-generator/blob/main/USAGE_GUIDE.md" 
            target="_blank" 
            rel="noopener noreferrer"
            className="full-guide-link"
          >
            📖 View Full Guide on GitHub →
          </a>
        </div>
      </div>
    </div>
  );
}

interface PlatformContentProps {
  platform: string;
}

function PlatformContent({ platform }: PlatformContentProps) {
  const content: Record<string, JSX.Element> = {
    discord: <DiscordGuide />,
    slack: <SlackGuide />,
    twitch: <TwitchGuide />,
    telegram: <TelegramGuide />,
    whatsapp: <WhatsAppGuide />,
    twitter: <TwitterGuide />,
    reddit: <RedditGuide />,
    imessage: <IMessageGuide />,
  };

  return content[platform] || null;
}

function DiscordGuide() {
  return (
    <div className="guide-content">
      <h3>💬 Discord</h3>
      
      <h4>Requirements:</h4>
      <ul>
        <li>Server owner or "Manage Emojis" permission</li>
        <li>PNG format (max 256 KB)</li>
        <li>Recommended: 128x128px</li>
      </ul>

      <h4>Steps:</h4>
      <ol>
        <li>
          <strong>Download Your Emoji</strong>
          <p>Click the "📥 Download" button below</p>
          <p>Save the PNG file</p>
        </li>
        <li>
          <strong>Open Discord Server Settings</strong>
          <p>Right-click your server icon</p>
          <p>Select "Server Settings"</p>
          <p>Click "Emoji" tab</p>
        </li>
        <li>
          <strong>Upload Emoji</strong>
          <p>Click "Upload Emoji"</p>
          <p>Select your downloaded PNG</p>
          <p>Name it (e.g., <code>astronautcat</code>)</p>
          <p>Click "Save"</p>
        </li>
        <li>
          <strong>Use It!</strong>
          <p>Type <code>:youremojiname:</code> in any channel</p>
          <p>Example: <code>:astronautcat:</code></p>
        </li>
      </ol>

      <h4>Limits:</h4>
      <ul>
        <li>Free Server: 50 emojis</li>
        <li>Nitro Server: 250 emojis</li>
      </ul>

      <p className="tip">💡 <strong>Tip:</strong> Our emojis are ~50-150 KB, perfect for Discord!</p>
    </div>
  );
}

function SlackGuide() {
  return (
    <div className="guide-content">
      <h3>💼 Slack</h3>
      
      <h4>Requirements:</h4>
      <ul>
        <li>Workspace admin permission</li>
        <li>PNG or GIF (max 128 KB)</li>
        <li>Auto-resized to 128x128px</li>
      </ul>

      <h4>Steps:</h4>
      <ol>
        <li>
          <strong>Download Your Emoji</strong>
          <p>Click "📥 Download"</p>
        </li>
        <li>
          <strong>Open Workspace Settings</strong>
          <p>Click workspace name (top left)</p>
          <p>"Settings & administration"</p>
          <p>"Customize workspace"</p>
        </li>
        <li>
          <strong>Add Custom Emoji</strong>
          <p>Click "Emoji" tab</p>
          <p>"Add Custom Emoji"</p>
          <p>Upload PNG file</p>
          <p>Name it (letters, numbers, dashes only)</p>
          <p>Save</p>
        </li>
        <li>
          <strong>Use It!</strong>
          <p>Type <code>:youremojiname:</code> in messages</p>
          <p>Or use emoji picker</p>
        </li>
      </ol>

      <h4>Limits:</h4>
      <ul>
        <li>Free: Limited emojis</li>
        <li>Paid: Unlimited emojis</li>
      </ul>

      <p className="tip">💡 <strong>Tip:</strong> Name consistently (e.g., <code>rocket_purple</code>)</p>
    </div>
  );
}

function TwitchGuide() {
  return (
    <div className="guide-content">
      <h3>🎮 Twitch</h3>
      
      <h4>Requirements:</h4>
      <ul>
        <li>Twitch Affiliate or Partner status</li>
        <li>PNG with transparency</li>
        <li>3 sizes: 28x28px, 56x56px, 112x112px</li>
        <li>Max 1 MB per file</li>
      </ul>

      <h4>Steps:</h4>
      <ol>
        <li>
          <strong>Prepare Emote</strong>
          <p>Download your emoji</p>
          <p>Resize to 3 versions (28px, 56px, 112px)</p>
          <p>Use <a href="https://photopea.com" target="_blank" rel="noopener noreferrer">Photopea</a> for resizing</p>
        </li>
        <li>
          <strong>Access Creator Dashboard</strong>
          <p>Go to twitch.tv/dashboard</p>
          <p>Settings → Affiliate/Partner → Emotes</p>
        </li>
        <li>
          <strong>Upload Emote</strong>
          <p>Click "Upload Emotes"</p>
          <p>Upload all 3 sizes</p>
          <p>Name it (6-25 characters)</p>
          <p>Select subscriber tier</p>
          <p>Submit</p>
        </li>
        <li>
          <strong>Wait for Approval</strong>
          <p>Review takes 24-48 hours</p>
          <p>Check email for approval</p>
        </li>
      </ol>

      <h4>Slots:</h4>
      <ul>
        <li>Affiliate: 5 emotes total</li>
        <li>Partner: More based on growth</li>
      </ul>

      <p className="tip">💡 <strong>Tip:</strong> Test visibility at 28x28px!</p>
    </div>
  );
}

function TelegramGuide() {
  return (
    <div className="guide-content">
      <h3>✈️ Telegram</h3>
      
      <h4>Requirements:</h4>
      <ul>
        <li>PNG with transparency</li>
        <li>512x512px</li>
        <li>Max 512 KB</li>
      </ul>

      <h4>Steps:</h4>
      <ol>
        <li>
          <strong>Download Your Emoji</strong>
        </li>
        <li>
          <strong>Find @Stickers Bot</strong>
          <p>Search <code>@Stickers</code> in Telegram</p>
          <p>Start conversation</p>
        </li>
        <li>
          <strong>Create Sticker Pack</strong>
          <p>Send <code>/newpack</code></p>
          <p>Choose pack name</p>
          <p>Send your PNG image</p>
          <p>Send representing emoji (e.g., 🚀)</p>
          <p>Send <code>/publish</code></p>
          <p>Choose pack short name</p>
        </li>
        <li>
          <strong>Share Your Pack</strong>
          <p>Bot gives you link: <code>t.me/addstickers/yourpack</code></p>
          <p>Add more with <code>/addsticker</code></p>
        </li>
      </ol>

      <h4>Limits:</h4>
      <ul>
        <li>Max 120 stickers per pack</li>
      </ul>

      <p className="tip">💡 <strong>Tip:</strong> Create themed packs!</p>
    </div>
  );
}

function WhatsAppGuide() {
  return (
    <div className="guide-content">
      <h3>📱 WhatsApp</h3>
      
      <h4>Requirements:</h4>
      <ul>
        <li>Third-party sticker app</li>
        <li>PNG or WebP (512x512px)</li>
        <li>Max 100 KB</li>
      </ul>

      <h4>Steps:</h4>
      <ol>
        <li>
          <strong>Download Sticker App</strong>
          <p>iOS: "Sticker Maker Studio"</p>
          <p>Android: "Sticker.ly"</p>
        </li>
        <li>
          <strong>Create Pack</strong>
          <p>Open app</p>
          <p>"Create New Pack"</p>
          <p>Name your pack</p>
          <p>Add emojis (min 3)</p>
        </li>
        <li>
          <strong>Add to WhatsApp</strong>
          <p>Tap "Add to WhatsApp" in app</p>
          <p>Open WhatsApp</p>
          <p>Use sticker icon in chats</p>
        </li>
      </ol>

      <h4>Limits:</h4>
      <ul>
        <li>Min 3 stickers per pack</li>
        <li>Max 30 stickers per pack</li>
      </ul>

      <p className="tip">💡 <strong>Tip:</strong> Compress with <a href="https://squoosh.app" target="_blank" rel="noopener noreferrer">Squoosh</a> if over 100 KB</p>
    </div>
  );
}

function TwitterGuide() {
  return (
    <div className="guide-content">
      <h3>🐦 Twitter/X</h3>
      
      <h4>Method: Use as Images</h4>

      <h4>Steps:</h4>
      <ol>
        <li>
          <strong>Download Your Emoji</strong>
        </li>
        <li>
          <strong>Attach to Tweet</strong>
          <p>Create new tweet</p>
          <p>Click image icon</p>
          <p>Upload emoji PNG</p>
          <p>Add text</p>
          <p>Post!</p>
        </li>
      </ol>

      <h4>Limits:</h4>
      <ul>
        <li>Max 4 images per tweet</li>
        <li>Max 5 MB (PNG)</li>
      </ul>

      <p className="tip">💡 <strong>Tip:</strong> Save emojis in a folder for quick access</p>
    </div>
  );
}

function RedditGuide() {
  return (
    <div className="guide-content">
      <h3>🤖 Reddit</h3>
      
      <h4>Requirements:</h4>
      <ul>
        <li>Must be subreddit moderator</li>
        <li>PNG (128x128px recommended)</li>
      </ul>

      <h4>Steps:</h4>
      <ol>
        <li>
          <strong>Access Mod Tools</strong>
          <p>Go to your subreddit</p>
          <p>Click "Mod Tools"</p>
          <p>Select "Emoji"</p>
        </li>
        <li>
          <strong>Upload Emoji</strong>
          <p>Click "Upload Emoji"</p>
          <p>Select PNG file</p>
          <p>Name it</p>
          <p>Set permissions</p>
          <p>Save</p>
        </li>
        <li>
          <strong>Members Use It</strong>
          <p>Type <code>:emojiname:</code> in posts/comments</p>
        </li>
      </ol>

      <h4>Limits:</h4>
      <ul>
        <li>Max 250 emojis per subreddit</li>
        <li>Moderators only can upload</li>
      </ul>

      <p className="tip">💡 <strong>Tip:</strong> Great for subreddit identity!</p>
    </div>
  );
}

function IMessageGuide() {
  return (
    <div className="guide-content">
      <h3>📲 iMessage (iOS)</h3>
      
      <h4>Method: Use Sticker Apps</h4>

      <h4>Steps:</h4>
      <ol>
        <li>
          <strong>Download Sticker App</strong>
          <p>"Sticker Drop" from App Store</p>
          <p>"Sticker Pals"</p>
        </li>
        <li>
          <strong>Import Emojis</strong>
          <p>Open app</p>
          <p>Import downloaded images</p>
          <p>Create pack</p>
        </li>
        <li>
          <strong>Use in iMessage</strong>
          <p>Open Messages</p>
          <p>Tap App Store icon</p>
          <p>Select sticker pack</p>
          <p>Send!</p>
        </li>
      </ol>

      <h4>Requirements:</h4>
      <ul>
        <li>PNG with transparency</li>
        <li>Size varies by app</li>
      </ul>

      <p className="tip">💡 <strong>Tip:</strong> Third-party apps easier than building from scratch</p>
    </div>
  );
}
