# Plot - Garden Planner

A personal garden planner PWA designed for central Scotland (USDA zone 8a, RHS H4-H5). Plan your garden beds, track plantings, and follow Scotland-specific sowing schedules — all offline, all local.

## Features

- **Garden Layout Designer** — drag-and-drop canvas for planning garden beds
- **Plant Database** — 55+ plants with Scotland-specific sowing/harvest dates
- **Planting Tracker** — record what's planted where and track progress
- **Gantt Schedule** — visual timeline of your growing year
- **Garden Journal** — log observations with photos and weather notes
- **Task Dashboard** — automatic reminders based on your planting schedule
- **Full PWA** — works offline, installable on any device

## Tech Stack

- React 19 / TypeScript / Vite
- Tailwind CSS v4
- React Konva (garden canvas)
- Dexie.js (IndexedDB)
- vite-plugin-pwa
- Lucide React (icons)
- date-fns (date handling)

---

## Prerequisites

- **Node.js** 18 or higher
- **npm** 9 or higher

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd PubCustard
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

   > If you encounter peer dependency warnings, use `npm install --legacy-peer-deps`.

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open in your browser:**

   Navigate to [http://localhost:5173](http://localhost:5173). The app will hot-reload as you make changes.

## Production Build

```bash
npm run build
```

This generates the optimised production bundle in `dist/`, including the PWA service worker. To preview the production build locally:

```bash
npm run preview
```

---

## Installing as a PWA

Plot works as a Progressive Web App — you can install it on your phone or desktop for an app-like experience.

**On Android (Chrome):**
1. Open the app URL in Chrome
2. Tap the three-dot menu (top right)
3. Tap "Add to Home Screen" or "Install app"

**On iOS (Safari):**
1. Open the app URL in Safari
2. Tap the Share button (bottom centre)
3. Tap "Add to Home Screen"

**On Desktop (Chrome/Edge):**
1. Open the app URL
2. Click the install icon in the address bar (or Menu > "Install Plot")

Once installed, the app works fully offline.

---

## Using the App

### Dashboard (Home)

The dashboard is your starting point each time you open Plot.

- **Seasonal Reminders** appear automatically based on the current date and the sowing/transplant/harvest windows of the plants in your database. For example, if it's March, you'll see reminders like "Time to sow peas indoors" or "Time to direct sow radish".
- **Tasks** are your personal to-do list. Click **Add Task** to create manual tasks with optional due dates (e.g. "Build new raised bed", "Order seed potatoes"). Mark them complete with the circle checkbox. Overdue tasks are highlighted in red.

### Garden Layout

A grid-based canvas for designing your garden from above.

- **Add Bed**: Click the button to place a new rectangular bed on the canvas. Each bed defaults to "Bed 1", "Bed 2", etc.
- **Move beds**: Drag any bed to reposition it.
- **Resize beds**: Select a bed, then drag the corner/edge handles to resize.
- **Rotate beds**: Use the rotation handle on a selected bed.
- **Edit bed details**: Click/tap a bed to open the edit panel on the right, where you can rename it, change its type (vegetable, fruit, flower, herb, mixed, path, structure), and see the colour change accordingly.
- **Delete beds**: Select a bed and click the red trash icon in the toolbar, or use the delete button in the edit panel.
- **Zoom**: Use the +/- buttons or scroll wheel. **Pan**: Drag on empty canvas space.
- **Grid toggle**: Show/hide the grid overlay for alignment.

The scale indicator (bottom-left) shows current zoom level and grid scale (default: 1 square = 0.5m).

### Plants & Plantings

This section has two tabs:

**Plant Database:**
- Browse all 55+ built-in plants with Scotland-specific growing data.
- **Search** by name or **filter** by category (vegetable, fruit, herb, flower).
- Click any plant card to open a detail panel showing: sowing windows, harvest period, spacing, sun/water requirements, companion plants, antagonists, and notes.
- **Add custom plants** using the "Add Plant" button — fill in the name, category, spacing, and notes.

**My Plantings:**
- Track what you've actually planted. Click **Add Planting** to record:
  - Which plant (from the database)
  - Which bed (from your garden layout)
  - Dates sown (indoor/direct), transplanted, harvested
  - Status: planned → sown → transplanted → growing → harvesting → finished (or failed)
  - Quantity and notes
- Update the status of any planting using the dropdown on each row.
- Filter by status to see e.g. only "growing" plants.

### Schedule (Gantt Chart)

A visual timeline of the entire growing year, January through December.

**Template view:**
- Shows the default sowing/harvest schedule for every plant in your database.
- Colour-coded bars:
  - Yellow = indoor sowing window
  - Green = direct sow window
  - Blue = transplant window
  - Red = harvest window
- Filter by plant category.
- A green vertical line marks today's date.

**My Plan view:**
- Shows only the plants you've added as plantings, with their schedule bars and current status.

Scroll horizontally to see the full year. Use this to plan what to sow when and spot gaps in your growing calendar.

### Journal

A chronological diary for garden observations.

- Click the **+** floating button (bottom-right) to add a new entry.
- Each entry supports:
  - **Date** (defaults to today)
  - **Free text** notes
  - **Weather** — tap an icon (sunny, cloudy, rainy, frost, snow, windy, overcast)
  - **Link to a bed or plant** — optional dropdowns to tag entries
  - **Photo** — upload from your device. Images are automatically compressed to max 1200px wide and stored locally.
- Entries appear newest-first in a scrollable feed.

### Settings

Access via the sidebar (desktop) or the gear icon.

- **Garden Name**: Personalise the name of your garden.
- **Units**: Toggle between metric (cm/m, default) and imperial (in/ft).
- **Dark Mode**: Toggle dark/light theme.
- **Export Data**: Downloads all your data (plants, beds, plantings, journal, tasks, settings) as a single JSON file. Use this for backups.
- **Import Data**: Load a previously exported JSON backup. This replaces all current data.
- **Clear All Data**: Wipes everything and re-seeds the default plant database. Requires double confirmation.

---

## Data & Storage

All data is stored **locally in your browser** using IndexedDB (via Dexie.js). Nothing is sent to any server.

**Database stores:**
| Store | Contents |
|-------|----------|
| `plants` | Plant database (built-in + custom) |
| `gardens` | Garden layout metadata (grid size, scale) |
| `beds` | Bed shapes, positions, names, colours |
| `plantings` | What's planted where and when |
| `journal` | Journal entries with photos |
| `tasks` | Manual to-do items |
| `settings` | User preferences |

**First launch:** The app automatically seeds 55+ plants with Scotland-specific growing data and creates a default garden.

**Backups:** Regularly use Settings → Export to save a JSON backup. If you clear your browser data or switch devices, you can restore from this file using Settings → Import.

---

## Offline Support

After the first load, the app works entirely without internet. The service worker caches all assets (JS, CSS, HTML, icons). Data is stored in IndexedDB, which persists across browser sessions.

---

## Project Structure

```
src/
├── components/
│   └── Navigation.tsx      # Responsive sidebar + bottom tabs
├── data/
│   └── seedPlants.ts       # 55+ Scotland-specific plant records
├── pages/
│   ├── DashboardPage.tsx   # Home screen with tasks & reminders
│   ├── GardenPage.tsx      # Canvas layout designer (React Konva)
│   ├── PlantsPage.tsx      # Plant database & planting tracker
│   ├── SchedulePage.tsx    # Gantt chart timeline
│   ├── JournalPage.tsx     # Garden diary with photos
│   └── SettingsPage.tsx    # Preferences & data management
├── App.tsx                 # Root component with routing
├── db.ts                   # Dexie database setup & seeding
├── types.ts                # TypeScript interfaces
├── main.tsx                # Entry point
└── index.css               # Tailwind imports & theme
```

## License

Private project — not currently licensed for redistribution.
