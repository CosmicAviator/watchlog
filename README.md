# WatchLog Next.js

Personal entertainment tracker with aerospace theming. Built with Next.js, Supabase, and deployed on Vercel.

## Quick Start

### 1. Clone and Install

```bash
cd watchlog-next
npm install
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase-schema.sql`
3. Go to Settings → API and copy:
   - Project URL
   - anon public key

### 3. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
TMDB_API_KEY=your_tmdb_api_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

### Option 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option 2: GitHub Integration

1. Push to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add environment variables
4. Deploy

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Landing page
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Cosmos theme
│   ├── auth/
│   │   ├── login/        # Login page
│   │   └── signup/       # Sign up page
│   └── dashboard/        # Main app (protected)
├── components/
│   ├── Dashboard.tsx     # Main dashboard
│   ├── MissionCard.tsx   # Movie card
│   ├── MissionForm.tsx   # Add entry form
│   ├── StatsDashboard.tsx# Statistics
│   └── EditModal.tsx     # Edit entry
└── lib/
    ├── supabase-browser.ts
    ├── supabase-server.ts
    └── types.ts
```

## Features

- 🎬 Movie/Series/Anime tracking
- 📊 Statistics dashboard
- 🌌 Cosmos Observatory theme
- 🔐 Email/password authentication
- 🖼️ Custom poster URLs
- 🔄 Real-time updates

---

*Every film is a flight. Every series is a mission. Log them all.*
