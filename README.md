# Plot - Garden Planner

A personal garden planner PWA designed for central Scotland (USDA zone 8a). Plan your garden beds, track plantings, and follow Scotland-specific sowing schedules — all offline, all local.

## Features

- **Garden Layout Designer** — drag-and-drop canvas for planning garden beds
- **Plant Database** — 50+ plants with Scotland-specific sowing/harvest dates
- **Planting Tracker** — record what's planted where and track progress
- **Gantt Schedule** — visual timeline of your growing year
- **Garden Journal** — log observations with photos and weather notes
- **Task Dashboard** — automatic reminders based on your planting schedule
- **Full PWA** — works offline, installable on any device

## Tech Stack

- React 18+ / TypeScript / Vite
- Tailwind CSS
- React Konva (garden canvas)
- Dexie.js (IndexedDB)
- vite-plugin-pwa

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Data

All data is stored locally in your browser via IndexedDB. Use Settings → Export to back up your data as JSON.
