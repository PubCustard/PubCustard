# Plot - Garden Planner

A personal garden planner for central Scotland. Plan beds, track plantings, follow sowing schedules — all offline, all in your browser.

---

## Quick Start

You need [Node.js](https://nodejs.org/) version 18 or newer. If you're not sure, open a terminal and run `node -v` — if you see `v18` or higher, you're good.

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd PubCustard

# 2. Install everything
npm install --legacy-peer-deps

# 3. Run the app
npm run dev
```

That's it. Open **http://localhost:5173** in your browser. The app is ready to use.

> **Tip:** On first launch, the app automatically loads 55+ plants with Scotland-specific sowing dates. You don't need to set anything up — just start exploring.

---

## Install on Your Phone or Computer

Plot works like a native app if you install it from your browser:

| Platform | How to install |
|----------|---------------|
| **Android** | Open in Chrome > tap the 3-dot menu > "Install app" |
| **iPhone/iPad** | Open in Safari > tap Share > "Add to Home Screen" |
| **Desktop** | Open in Chrome or Edge > click the install icon in the address bar |

Once installed, it works offline — no internet needed.

---

## How to Use Plot

Plot has five main sections, accessible from the bottom bar (phone) or sidebar (desktop).

### 1. Dashboard

Your home screen. Shows:

- **Seasonal reminders** — the app checks today's date against the plant database and tells you what to sow, transplant, or harvest right now.
- **Your task list** — tap **Add Task** to create to-dos like "Order seed potatoes" or "Build raised bed". Give them due dates and tick them off as you go.

### 2. Garden Layout

Draw your garden on a grid canvas.

- Tap **Add Bed** to drop a new bed onto the grid.
- **Drag** beds to move them. **Pull the handles** to resize. **Rotate** with the top handle.
- **Tap a bed** to edit its name and type (vegetable, fruit, flower, herb, path, etc.) — each type gets a different colour.
- Use **+/-** to zoom, drag empty space to pan, and toggle the grid on/off.

### 3. Plants & Plantings

Two tabs here:

**Plant Database** — Browse or search all 55+ built-in plants. Tap any plant to see its full details: when to sow, when to harvest, spacing, companion plants, and more. You can also add your own custom plants.

**My Plantings** — This is where you record what you've actually planted. Tap **Add Planting**, pick a plant and a bed, and track its journey:

> planned → sown → transplanted → growing → harvesting → finished

Update the status anytime using the dropdown on each entry.

### 4. Schedule

A visual calendar showing the full growing year (January to December).

- **Template view** shows the ideal sowing/harvest schedule for all plants — great for planning.
- **My Plan view** shows just your plantings.
- Bars are colour-coded: yellow = indoor sow, green = direct sow, blue = transplant, red = harvest.
- A green line marks today, so you can see where you are in the season.

Scroll sideways to see the full year.

### 5. Journal

A garden diary.

- Tap the **+** button to add an entry.
- Write what you observed, pick the weather, optionally link it to a bed or plant, and attach a photo if you like.
- Photos are automatically shrunk to save space.
- Entries show newest-first.

### Settings

Open from the sidebar (desktop) or bottom of the navigation.

- **Dark mode** — toggle on/off.
- **Units** — metric (default) or imperial.
- **Export** — download all your data as a backup file (JSON).
- **Import** — restore from a backup file.
- **Clear all data** — start fresh (asks you twice to confirm).

---

## Backing Up Your Data

Everything is stored in your browser — if you clear browser data, it's gone. To protect your work:

1. Go to **Settings**
2. Tap **Export All Data**
3. Save the downloaded JSON file somewhere safe

To restore: go to Settings > Import and select your backup file.

---

## Building for Production

If you want to deploy the app to a web server:

```bash
npm run build
```

This creates a `dist/` folder with everything needed. To test the production build locally:

```bash
npm run preview
```

---

## For Developers

### Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS v4 | Styling |
| React Konva | Garden canvas (drag & drop) |
| Dexie.js | Local database (IndexedDB) |
| vite-plugin-pwa | Offline support & install |
| Lucide React | Icons |
| date-fns | Date formatting |

### Project Structure

```
src/
├── components/Navigation.tsx   — sidebar + bottom tabs
├── data/seedPlants.ts          — 55+ plant records for Scotland
├── pages/
│   ├── DashboardPage.tsx       — tasks & seasonal reminders
│   ├── GardenPage.tsx          — drag-and-drop bed designer
│   ├── PlantsPage.tsx          — plant database & planting tracker
│   ├── SchedulePage.tsx        — Gantt chart timeline
│   ├── JournalPage.tsx         — diary with photos & weather
│   └── SettingsPage.tsx        — preferences & data management
├── App.tsx                     — root component
├── db.ts                       — database setup & seed logic
├── types.ts                    — TypeScript types
├── main.tsx                    — entry point
└── index.css                   — Tailwind config & theme colours
```

### Database Stores

| Store | What it holds |
|-------|---------------|
| `plants` | Plant database (built-in + custom) |
| `gardens` | Garden grid size and scale |
| `beds` | Bed positions, shapes, names, colours |
| `plantings` | What's planted where and when |
| `journal` | Diary entries with photos |
| `tasks` | To-do items |
| `settings` | Preferences (units, dark mode, etc.) |
