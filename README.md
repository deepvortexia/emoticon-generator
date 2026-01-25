# 🌀 Deep Vortex - AI Emoticon Generator

Generate custom emojis and stickers using AI! Perfect for Discord, Slack, and social media.

![Deep Vortex Banner](https://via.placeholder.com/800x200/8b5cf6/ffffff?text=Deep+Vortex+Emoticon+Generator)

## ✨ Features

- 🎨 **Two Generation Modes:**
  - **Simple Emojis**: Flat, minimalist iOS-style emojis (1 word prompts)
  - **Creative Stickers**: Detailed illustrations with actions/scenes (complex prompts)
  
- ⚡ **Fast Generation**: 3-5 seconds per image
- 💾 **Gallery**: Save and view your generation history
- 📥 **Easy Download**: One-click download as PNG
- 🔄 **Regenerate**: Create variations of the same prompt
- 💡 **Prompt Examples**: Click-to-use example prompts
- 🎲 **Surprise Me**: Random prompt generator
- 📊 **Usage Counter**: Track how many images you've generated

## 📱 How to Use Your Emojis

Once you've generated your perfect emoji, you can use it across all major platforms!

### Quick Platform Guide:

- **💬 Discord** - Upload to server emojis (max 256 KB)
- **💼 Slack** - Add to workspace emojis (max 128 KB)
- **🎮 Twitch** - Create channel emotes (requires Affiliate/Partner)
- **✈️ Telegram** - Build sticker packs with @Stickers bot
- **📱 WhatsApp** - Use sticker maker apps
- **🐦 Twitter/X** - Attach as images in tweets
- **🤖 Reddit** - Upload as subreddit emojis (mods only)

**👉 [Complete Platform Usage Guide](USAGE_GUIDE.md)** - Detailed step-by-step instructions for every platform!

### Platform Requirements at a Glance:

| Platform | Format | Size | File Limit |
|----------|--------|------|------------|
| Discord | PNG | 128x128px | 256 KB |
| Slack | PNG | 128x128px | 128 KB |
| Twitch | PNG | 28/56/112px | - |
| Telegram | PNG | 512x512px | 512 KB |
| WhatsApp | PNG | 512x512px | 100 KB |

💡 **Tip**: Our emojis generate at 1024x1024px (~50-150 KB) - perfect for all platforms!

## 🚀 Live Demo

Visit: [https://emoticon-generator-7cvg.vercel.app](https://emoticon-generator-7cvg.vercel.app)

## 📸 Examples

### Simple Flat Emojis

| Prompt | Style |
|--------|-------|
| `happy face` | Flat, iOS-style |
| `rocket` | Minimalist |
| `pizza` | Simple |

### Creative Stickers

| Prompt | Style |
|--------|-------|
| `astronaut cat in space` | Detailed illustration |
| `robot dancing with headphones` | Sticker-style |
| `dragon wearing sunglasses` | Creative |

## 🎯 How to Write Good Prompts

### For Flat Emojis (iOS-style):
Use **1-2 words**, simple objects:
```
✅ pizza
✅ rocket
✅ heart
✅ happy face
✅ coffee cup
```

### For Creative Stickers:
Use **descriptive phrases** with actions:
```
✅ astronaut cat in space
✅ robot dancing with headphones
✅ cat playing guitar
✅ dragon breathing fire
```

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: CSS with custom design system
- **AI Model**: [fofr/sdxl-emoji](https://replicate.com/fofr/sdxl-emoji) via Replicate API
- **Deployment**: Vercel
- **Storage**: localStorage (for gallery)

## 🏗️ Architecture

```
emoticon-generator/
├── src/
│   ├── App.tsx           # Main application component
│   ├── App.css           # Styles and design system
│   ├── components/       # Reusable components
│   │   ├── Gallery.tsx   # Image history gallery
│   │   └── Gallery.css   # Gallery styles
│   └── main.tsx         # Entry point
├── api/
│   ├── generate.ts      # Image generation endpoint
│   └── download.ts      # Image download proxy
└── public/
    └── screenshots/     # Documentation images
```

## 💰 Cost & Limits

- **Model**: fofr/sdxl-emoji on Replicate
- **Cost**: ~$0.003 per image
- **Rate Limit**: 6 requests/minute (with <$5 credit)
- **With $2 credit**: ~660 images can be generated

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Replicate API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/deepvortexia/emoticon-generator.git
cd emoticon-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
REPLICATE_API_TOKEN=your_api_token_here
```

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## 📝 API Usage

### Generate Endpoint

**POST** `/api/generate`

```json
{
  "prompt": "happy cat"
}
```

**Response:**
```json
{
  "image": "https://replicate.delivery/...",
  "id": "prediction-id"
}
```

## 💡 Pro Tips for Best Results

### Writing Prompts:

**For Simple Flat Emojis (iOS-style):**
```
✅ Good: "pizza", "rocket", "happy face"
❌ Avoid: "a beautiful photorealistic pizza with toppings"
```

**For Creative Stickers:**
```
✅ Good: "astronaut cat in space", "robot dancing with headphones"
❌ Avoid: "cat" (too simple for sticker style)
```

### Using Across Platforms:

1. **Download as PNG** - Best compatibility
2. **Check file size** - Use [Squoosh](https://squoosh.app) if too large
3. **Remove background** - Use [remove.bg](https://remove.bg) if needed
4. **Resize if needed** - Use [Photopea](https://photopea.com) for free editing
5. **Test on dark/light modes** - Ensure visibility

📖 **[Full Platform Guide](USAGE_GUIDE.md)** - Complete instructions for Discord, Slack, Twitch, Telegram, WhatsApp, and more!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- **AI Model**: [fofr/sdxl-emoji](https://replicate.com/fofr/sdxl-emoji) by fofr
- **API**: [Replicate](https://replicate.com)
- **Inspiration**: iOS/Android emoji design systems

## 📧 Contact

Created by [@deepvortexia](https://github.com/deepvortexia)

---

**⭐ If you like this project, give it a star!**

