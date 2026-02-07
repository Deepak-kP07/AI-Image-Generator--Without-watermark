<div align="center">

# ⚡ Zopkit AI Image & Video Generator

**Create stunning AI-generated images and videos with multi-model support, custom watermarking, and a beautiful dark-themed UI.**

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---


## 🚀 Overview

Zopkit is a client-side AI-powered creative tool that lets you generate images and videos using multiple AI models — all from a sleek, chat-style interface. Upload reference images for editing, apply custom watermarks with drag-and-drop positioning, and download your creations instantly.

---

## ✨ Features

### 🎨 Image Generation
- **Multi-Model Support** — Gemini 2.5 Flash, Gemini 3 Pro, Flux 1 Schnell, Stable Diffusion XL
- **Aspect Ratios** — Square (1:1), Landscape (16:9), Portrait (9:16), Standard (4:3, 3:4)
- **Batch Generation** — Generate 1–4 images per request
- **Image Editing** — Upload a reference image and describe your edits
- **Prompt Enhancement** — AI-powered prompt improvement for better results

### 🎬 Video Generation
- **Veo 3.1 Fast** — Quick preview-quality videos
- **Veo 3.1 Pro** — High-quality video output
- **Resolution Options** — 720p and 1080p
- **Native Audio** — Optional audio generation support

### 🔖 Watermark System
- Upload custom watermark images (PNG / SVG)
- Drag-and-drop or preset positioning
- Adjustable size, opacity, and rotation
- Save multiple watermark presets
- Live preview before applying
- Stored in `localStorage` — no database required

### 💎 User Interface
- Modern dark-theme design
- Responsive layout (mobile & desktop)
- Animated landing page (AOS scroll animations)
- Chat-style conversation interface
- Image lightbox preview & one-click downloads

---

## 📁 Project Structure

```
Zopkit AI Image Generator/
├── components/
│   ├── Button.tsx              # Reusable button component
│   ├── ChatArea.tsx            # Main chat / message display
│   ├── InputArea.tsx           # Prompt input with image upload
│   ├── LandingPage.tsx         # Marketing landing page
│   ├── Sidebar.tsx             # Settings panel (models, ratios, watermarks)
│   └── WatermarkModal.tsx      # Watermark configuration modal
├── services/
│   └── geminiService.ts        # API layer (Gemini, Flux, SDXL)
├── utils/
│   └── watermark.ts            # Canvas-based watermark compositing
├── App.tsx                     # Root application component
├── index.tsx                   # React entry point
├── types.ts                    # TypeScript type definitions
├── constants.ts                # App constants & model options
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
├── vercel.json                 # Vercel deployment config
└── package.json                # Dependencies & scripts
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **npm** (comes with Node.js)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Required — Google Gemini API key
API_KEY=your_gemini_api_key_here

# Optional — Stability AI (for Flux 1 Schnell model)
STABILITY_API_KEY=your_stability_key_here

# Optional — Hugging Face (for Stable Diffusion XL model)
HF_API_KEY=your_huggingface_key_here
```

> **Where to get API keys:**
> | Key | Provider | Link |
> |-----|----------|------|
> | `API_KEY` | Google AI Studio | https://aistudio.google.com/app/apikey |
> | `STABILITY_API_KEY` | Stability AI | https://platform.stability.ai/ |
> | `HF_API_KEY` | Hugging Face | https://huggingface.co/settings/tokens |

### 3. Start the Development Server

```bash
npm run dev
```

Open your browser at **http://localhost:5173** → click **Launch App** to enter the generator.

---

## 📦 Build & Deploy

### Production Build

```bash
npm run build       # Compile TypeScript & build with Vite
npm run preview     # Preview the production build locally
```

The output is written to the `dist/` directory.

### Deploy to Vercel

The project includes a `vercel.json` config ready for deployment:

1. Push your code to a Git repository
2. Import the project on [Vercel](https://vercel.com)
3. Add your environment variables (`API_KEY`, `STABILITY_API_KEY`, `HF_API_KEY`) in the Vercel dashboard
4. Deploy 🚀

---

## 🤖 Supported Models

| Model | Type | Provider | Notes |
|-------|------|----------|-------|
| **Nano Banana (Gemini 2.5 Flash)** | Image | Google | Fast, free-tier friendly |
| **Gemini 3 Pro Image** | Image | Google | High quality |
| **Flux 1 Schnell** | Image | Stability AI | Requires `STABILITY_API_KEY` |
| **Stable Diffusion XL** | Image | Hugging Face | Requires `HF_API_KEY` |
| **Veo 3.1 Fast** | Video | Google | Quick preview |
| **Veo 3.1 Pro** | Video | Google | High quality |

---

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| [React 18](https://react.dev) | UI framework |
| [TypeScript 5](https://www.typescriptlang.org) | Type safety |
| [Vite 5](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS 3](https://tailwindcss.com) | Utility-first styling |
| [AOS](https://michalsnik.github.io/aos/) | Scroll animations |
| [@google/genai](https://www.npmjs.com/package/@google/genai) | Gemini API client |

---

## 💾 Data Storage

Zopkit is a **fully client-side application** — no backend server or database required.

| Data | Storage | Persisted? |
|------|---------|------------|
| Watermark presets | `localStorage` (`zopkit_watermarks`) | ✅ Yes |
| App settings | React state | ❌ No (resets on refresh) |
| Chat messages | React state | ❌ No (resets on refresh) |

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| *"API Key missing"* error | Create `.env.local` with `API_KEY=your_key` and **restart** the dev server |
| Images not generating | Check your API quota/limits and verify the key has model access |
| Watermark not applying | Make sure a watermark is selected in the sidebar dropdown |
| Blank page after build | Ensure `dist/` has files; run `npm run build` again |
| Changes to `.env.local` not reflected | Vite requires a **full restart** (`Ctrl+C` → `npm run dev`) after env changes |

---

## 📄 License

This project is private and not licensed for redistribution.

---

<div align="center">

**Built with ❤️ Deepak KP **

</div>
