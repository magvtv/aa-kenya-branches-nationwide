# AA Kenya Branch Intelligence

Interactive React app for exploring AA Kenya branches using map and network views, then finding the best branch options based on services, distance, and branch load.

## What This App Does

- Shows branch locations on an interactive map (Leaflet).
- Shows branch relationships in a network graph view.
- Filters branches by available services.
- Displays detailed branch information in a side panel.
- Scores nearest/best branches using distance + load weighting.

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- Leaflet + React Leaflet
- react-force-graph-2d
- ESLint 10

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Start development server

```bash
npm run dev
```

By default, Vite serves the app at `http://localhost:5173`.

## Available Scripts

- `npm run dev` - start local development server
- `npm run build` - create production build
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint checks

## Project Structure

```text
src/
  app/                   # App shell, global provider, context hooks
  data/                  # Branch datasets and model notes
  features/
    branch-data/         # Data normalization and selectors
    branch-map/          # Map visualization
    branch-network/      # Graph visualization
    service-filters/     # Service filter UI + logic
    branch-detail/       # Detail side panel
    recommendation/      # Best-branch scoring utilities
  shared/lib/            # Shared helpers (e.g., haversine distance)
```

## Branch Recommendation Logic

The recommendation engine uses weighted scoring (lower is better):

- Distance from user location
- Branch load percentage
- Category adjustment for flagship branches

Implementation lives in `src/features/recommendation/findBestBranch.js`.

## Notes for Customization

- Update dataset fields in `src/data/aak-branches.json`.
- Adjust score weights in `src/features/recommendation/findBestBranch.js`.
- Change default user coordinates in `src/app/BranchIntelProvider.jsx`.
- Extend filters in `src/features/service-filters/`.

## License

Internal project - add a formal license if this will be shared publicly.
