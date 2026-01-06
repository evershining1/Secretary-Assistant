# 💎 Secretary: Your Intelligent Life Assistant

Secretary is a privacy-first, "Forever Free" intelligent assistant designed to streamline your schedule, sync your life, and focus on what truly matters. It combines advanced NLP, bi-directional calendar synchronization, and a premium user experience into a single, cohesive platform.

![Secretary Dashboard](/src/assets/logo.png)

## 🚀 Key Features

### 📅 Unified Calendar Sync
- **Multi-Provider Engine**: Bi-directional synchronization with Google Calendar (Outlook & Apple support ready).
- **Smart Conflict Resolution**: Automated diffing and merging based on `last_modified` timestamps.
- **Event-to-Task Conversion**: Automatic projection of calendar events into actionable dashboard tasks.

### 🧠 Intelligent Planning
- **Goal Alignment**: AI-driven task alignment with your long-term goals.
- **Natural Language Input**: Speed-dial task entry with smart detection of dates, times, and locations via Compromise.js.
- **Daily Reflection**: Automated insights and greetings based on your task history and completion patterns.

### 🔐 Privacy & Authentication
- **Local-First Architecture**: Your data is yours. Local storage is prioritized with optional cloud sync.
- **Premium Auth Flow**: Production-ready Supabase integration with support for Email, Google, and GitHub OAuth.
- **Onboarding Experience**: Intelligent name collection and personalization for new users.

### 🎨 Visual Excellence
- **Vibrant Design**: A custom white/salmon and dark/indigo theme system.
- **Glassmorphism UI**: High-end aesthetic with ambient background blurs and micro-animations.
- **Responsive Layout**: Optimized for both mobile and desktop usage.

## 🛠️ Tech Stack

- **Core**: React, Vite, Zustand
- **Backend/Auth**: Supabase (Free Tier)
- **Maps**: Photon (OpenStreetMap) - *Zero API Cost*
- **Weather**: Open-Meteo - *Zero API Cost*
- **NLP**: Compromise.js & Gemini 1.5 Flash
- **Styling**: Vanilla CSS with custom design tokens

## 📦 Setup & Installation

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Environment Setup**: Create a `.env` file based on `.env.example`
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_GOOGLE_CLIENT_ID=...
   VITE_GITHUB_CLIENT_ID=...
   ```
4. **Database Configuration**: Run the SQL migration scripts located in `docs/` in your Supabase SQL Editor.
5. **Launch**: `npm run dev`

## 📖 Documentation

Detailed setup guides and implementation plans are located in the [docs/](./docs) directory:
- [Walkthrough & Verification](./docs/walkthrough.md)
- [Supabase Integration Guide](./docs/SUPABASE_SETUP.md)
- [Google OAuth Setup](./docs/GOOGLE_OAUTH_SETUP.md)
- [Calendar Sync Architecture](./docs/calendar_sync_plan.md)

---
*Built with ❤️ by Antigravity Systems*
