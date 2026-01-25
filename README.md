# ✨ Emoticon Generator

AI-powered emoticon generator with a stunning cosmic purple theme, powered by OpenAI DALL-E 3.

![Emoticon Generator](https://github.com/user-attachments/assets/26ca3e88-3972-42f5-a4cd-1f0c387705cc)

## 🎨 Features

- **AI-Powered Generation**: Create unique emoticons using OpenAI DALL-E 3
- **Cosmic Purple Theme**: Beautiful animated starfield background with glassmorphism UI
- **Responsive Design**: Works perfectly on mobile and desktop devices
- **Download Images**: Save your generated emoticons to your device
- **Copy URLs**: Easily share emoticons by copying their URLs
- **Keyboard Support**: Press Enter to generate emoticons quickly
- **Loading Animations**: Cosmic loader with planet and orbit animations
- **Error Handling**: User-friendly error messages

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

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

3. Create a `.env` file in the root directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 📦 Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/deepvortexia/emoticon-generator)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub repository
3. Add your `OPENAI_API_KEY` environment variable in Vercel project settings
4. Deploy!

### Manual Deployment

```bash
npm install -g vercel
vercel
```

Don't forget to set the `OPENAI_API_KEY` environment variable in your Vercel project settings.

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Pure CSS with animations
- **API**: Vercel Serverless Functions
- **AI**: OpenAI DALL-E 3

## 📁 Project Structure

```
emoticon-generator/
├── src/
│   ├── App.tsx           # Main application component
│   ├── App.css           # Cosmic purple theme styling
│   ├── main.tsx          # React entry point
│   ├── index.css         # Base styles
│   └── vite-env.d.ts     # TypeScript definitions
├── api/
│   └── generate.ts       # OpenAI DALL-E API integration
├── public/               # Static assets
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── vercel.json          # Vercel deployment config
```

## 🎯 Usage

1. **Enter Description**: Type a description of your emoticon (e.g., "happy cosmic cat", "mystical star")
2. **Generate**: Click the "Generate" button or press Enter
3. **Wait**: Watch the cosmic loader while your emoticon is being created
4. **Download/Share**: Use the action buttons to download or copy the image URL
5. **Create New**: Click "New" to create another emoticon

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |

## 📝 License

MIT

## 💖 Credits

Made with ❤️ by **AphoraPixel**

Powered by **OpenAI DALL-E**
