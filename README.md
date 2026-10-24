# ⚡ Adeseluka Toba Samuel — Senior Engineer & Tech Lead Portfolio

> High-performance, learning-focused portfolio showcasing distributed systems, high-concurrency streaming engines, autonomous AI architectures, and IoT platforms

[![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-4.1-black?style=flat-square&logo=vercel)](https://sdk.vercel.ai/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

---
## 🌟 Overview

This repository houses the modern web portfolio and technical showcase for **Adeseluka Toba Samuel** (*SmartRay*) — Senior Software Engineer, Tech Lead, and Distributed Systems / AI Specialist with 8+ years of production experience across Lagos, Canada, and globally distributed engineering teams.

Unlike standard static portfolios, this application is engineered as a **deep technical hub**, featuring:
- **Interactive Architecture Modals** with real-world system diagrams and Architecture Decision Records (ADRs).
- **Embedded Streaming AI Assistant** powered by Vercel AI SDK with Google Gemini, OpenAI, and zero-config intelligent simulated fallback.
- **Continuous Tech Radar & Today-I-Learned (TIL)** knowledge repository.
- **In-Depth Engineering Blog Engine** discussing distributed caching, PgVector RAG, AWS cost optimization, and kernel-level desktop tuning.
- **Futuristic Glassmorphic Dark UI** with ambient radial glows, smooth micro-animations, and responsive layout.
---

## 🛠️ Architecture & Tech Stack

| Domain | Technology / Library | Purpose |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) | High-speed server rendering, streaming SSR, dynamic routing |
| **UI Library** | [React 19](https://react.dev) | Modern component architecture, hooks, and streaming transitions |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict type safety, interface-driven domain models |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS | Ultra-fast JIT styling, custom utility layers, ambient grid patterns |
| **AI Runtime** | [Vercel AI SDK](https://sdk.vercel.ai/) (`ai`, `@ai-sdk/google`, `@ai-sdk/openai`) | Streaming LLM integration (Gemini 1.5 Flash / GPT-4o-mini) |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/) + [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) | Cohesive iconography and interactive celebratory feedback |
| **Typography** | `next/font` (Geist Sans & Geist Mono) | Variable font optimization with zero layout shift |

---

## ✨ Key Features

### 1. 🤖 Embedded AI Engineering Assistant
- Located in a floating drawer accessible across the entire portfolio.
- Streams responses in real-time using **Vercel AI SDK**.
- **Multi-Provider Support**: Supports **Google Gemini (`gemini-1.5-flash`)** and **OpenAI (`gpt-4o-mini`)**.
- **Zero-Config Intelligent Fallback**: If no API keys are configured, a custom deterministic streaming engine activates automatically, providing instant answers for recruiter pitches, system deep-dives, and technical matrices.

### 2. 🏗️ Deep-Dive Project Architecture Modals
- Filter projects by domain (**AI & Machine Learning**, **Distributed Systems**, **Cloud & DevOps**, **IoT & Embedded**).
- Open interactive modals featuring:
  - High-level business overview and verified production metrics (e.g., *10,000+ live viewers*, *28% AWS cost reduction*, a planned device line by HP for developers).
  - **Architecture Decision Records (ADRs)** detailing context, alternative solutions considered, trade-offs, and final outcomes.
  - Interactive ASCII / visual architecture flowcharts.
  - Direct links to live deployments and GitHub repositories.
  - Transparent **Private / Enterprise NDA** indicators explaining system boundaries.

### 3. 📝 Technical Writing & Engineering Blog
- Complete technical writing engine with categorised articles, reading time estimates, author metadata, and key takeaways.
- Articles covering real-world production engineering:
  - *Why PgVector in PostgreSQL Beats Standalone Pinecone for Multi-Tenant SaaS*
  - *Slashing AWS Video Transcoding Costs by 28% via Event-Driven SNS & MediaConvert*
  - *Preventing Memory Leaks in GNOME Shell Compositor Extensions*

### 4. 📡 Continuous Learning Tech Radar & TIL
- Visual radar classifying technologies across **Adopt**, **Trial**, **Assess**, and **Hold** rings.
- Live **Today I Learned (TIL)** feed detailing granular engineering breakthroughs in kernel compilation, Go worker pools, and vector quantization.

### 5. 🎨 Polished Design System
- Native dark mode (`#07090e`) with tailored radial accents (`sky-500`, `emerald-500`).
- Responsive navigation bar with mobile slide-out drawer.
- Accessible semantic HTML with optimized metadata and OpenGraph tags.

---

## 📁 Project Structure

```
portfolio-web/
├── public/                  # Static assets & favicon
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/        # Streaming AI API route (Gemini / OpenAI / Fallback)
│   │   │       └── route.ts
│   │   ├── blog/            # Technical blog pages & dynamic post view
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css      # Design tokens, radial glows, background grid pattern
│   │   ├── layout.tsx       # Root layout, font definitions, header/footer shells
│   │   └── page.tsx         # Main landing page assembling core sections
│   ├── components/
│   │   ├── AIAssistantDrawer.tsx   # Floating interactive AI assistant widget
│   │   ├── AboutSection.tsx        # Career highlights, philosophy, technical matrix
│   │   ├── BlogArticleView.tsx     # Rich markdown article renderer
│   │   ├── BlogCard.tsx            # Blog post preview card
│   │   ├── BlogIndexClient.tsx     # Searchable & filterable blog post index
│   │   ├── BlogSection.tsx         # Featured blog articles grid
│   │   ├── Header.tsx              # Responsive sticky navigation bar
│   │   ├── HeroSection.tsx         # Executive hero, key stats, resume CTA
│   │   ├── ProjectDetailModal.tsx  # Deep-dive architecture modal with ADRs
│   │   ├── ProjectsGrid.tsx        # Filterable project portfolio gallery
│   │   └── TechRadarSection.tsx    # Technology radar & TIL dispatches
│   ├── data/
│   │   ├── blogData.ts             # Published technical articles & metadata
│   │   └── portfolioData.ts        # Projects, ADRs, career timeline, bio & tech skills
│   ├── lib/
│   │   ├── aiKnowledge.ts          # Structured context & system prompt for AI
│   │   └── content.ts              # Content utilities & reading time calculator
│   └── types/
│       ├── blog.ts                 # TypeScript types for blog articles
│       └── portfolio.ts            # TypeScript interfaces for projects, ADRs, bio
├── .env.example             # Example environment configuration
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies and build scripts
├── postcss.config.mjs       # PostCSS Tailwind plugin configuration
├── tsconfig.json            # TypeScript compiler configuration
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or later (v20+ recommended)
- **Package Manager**: `npm`, `pnpm`, `yarn`, or `bun`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/smartraysam/portfolio-web.git
   cd portfolio-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (Optional):**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` to enable live LLM models:
   ```env
   # Google Gemini (Default recommended: gemini-1.5-flash)
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

   # OR OpenAI (Alternative: gpt-4o-mini)
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   *(Note: If left empty, the application will automatically run the built-in intelligent simulated streaming engine.)*

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Launches the Next.js development server with hot-reload on `http://localhost:3000` |
| `npm run build` | Compiles the production build with type checking and page optimization |
| `npm run start` | Starts the production server using the compiled `.next` bundle |
| `npm run lint` | Runs ESLint checks across the codebase |

---

## 💼 Featured Production Systems

Here are some of the flagship architectures detailed within the portfolio:

| System | Role & Focus | Key Highlight |
|---|---|---|
| **[EasyPresenter Studio](https://github.com/smartraysam/easystream)** | *Creator & Full-Stack Architect* (Live Presentation / Broadcast) | Open-source live broadcast & church presentation console with sub-16ms WebSocket multi-display sync and transparent vMix/OBS overlay. |
| **[SellersPro.app](https://sellerspro.app)** | *Founder & Tech Lead* (Full-Stack / AI) | Autonomous RAG sales rep using **PgVector** inside PostgreSQL + Paystack webhook idempotency engine. |
| **Fenris Media Engine** | *Tech Lead* (Streaming Infrastructure) | Scaled live video to **10,000+ concurrent viewers** (<2.0s latency) using **Go & AWS IVS**, reducing transcoding costs by **28%**. |
| **HP Dev One Optimization** | *Software Engineer* (Linux / Systems) | Custom GNOME shell extensions & Linux compositor patches shipped to **50,000+ HP developer laptops**. |
| **resQ360 Dispatch Monorepo** | *Lead Backend Architect* (Distributed Systems) | NestJS modular emergency response hub with WebSocket geolocation dispatching and offline resilience. |
| **SmartGridNG** | *Backend & Network Engineer* (IoT / Networking) | High-concurrency campus hotspot provisioning engine interfacing directly with MikroTik RouterOS sockets. |
| **SusejMeters** | *Embedded & Cloud Engineer* (IoT / Energy) | STS prepaid electricity meter token vending system with automated over-the-air (OTA) token delivery. |

---

## 🚢 Deployment

### Deploy on Vercel
The easiest way to deploy this portfolio is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to a GitHub repository.
2. Import the repository into your Vercel Dashboard.
3. Add your environment variables (`GOOGLE_GENERATIVE_AI_API_KEY` or `OPENAI_API_KEY`).
4. Click **Deploy**.

### Self-Hosting via Docker / Node Server
You can also run the production server anywhere:
```bash
npm run build
npm run start
```

---

## 📬 Contact & Connect

- **Engineer**: Adeseluka Toba Samuel (*SmartRay*)
- **Email**: [adeselukatobasamuel@yahoo.com](mailto:adeselukatobasamuel@yahoo.com)
- **LinkedIn**: [linkedin.com/in/toba-adeseluka](https://linkedin.com/in/toba-adeseluka)
- **GitHub**: [github.com/smartraysam](https://github.com/smartraysam)
- **Schedule a Call**: [cal.com/smartraysam](https://cal.com/smartraysam)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
