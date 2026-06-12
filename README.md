# Therapists in Milan — direct booking

An advanced POC: a patient browses in‑person therapists in Milan and books a free
intro call **straight from the directory card** — tap a slot → booking sheet →
confirmed. Built to be wired to a real booking backend (Calendly) later.

## Core loop & scope

- **List ↔ stylized‑map toggle** — a directory list and a stylized SVG map (fuzzy
  radius per studio, no map API key). Shared Unobravo studios cluster; private
  studios stand alone. Exact address only after booking.
- **Availability lives on the card** — tap a day, tap a slot, book. No profile detour.
- **Two filters** — service type (Individual / Couples) and gender (Any / Female /
  Male), with a live count.

## Stack

React 19 · TanStack Start (SSR + file routing) · TanStack Query · Tailwind CSS v4 ·
TypeScript · ESLint · Vitest + Testing Library. Design tokens from Unobravo's
**Zenit 2.0** system.

## Requirements

Node **≥ 22.12** (see `.nvmrc`).

## Scripts

```bash
npm install
npm run dev        # dev server at http://localhost:3000
npm run build      # production build (client + SSR)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run test       # vitest (unit + booking-flow integration)
```

## Architecture

- `src/data/therapists.json` — **mock data** (4 studios, 6 therapists). Availability
  is stored as a 7‑day offset pattern (`dayOffset 0..6 → ["HH:MM", …]`). **This is
  the production‑swap point** — replace the read in `src/lib/therapists-data.ts`
  with a real API/DB call returning the same `DirectoryData` shape.
- `src/lib/therapists-data.ts` — a TanStack Start `createServerFn` that reads the
  JSON and resolves availability into concrete dates **once, on the server**, so
  SSR markup and client hydration share identical date strings.
- `src/lib/availability.ts` + `src/lib/time.ts` — date resolution. "Today" is the
  current calendar day **in Europe/Rome** (timezone‑correct, no midnight‑UTC
  off‑by‑one); the reference date is injectable for deterministic tests.
- `src/lib/{filter,studios}.ts` — pure filtering and studio grouping.
- `src/query/therapists.ts` — `queryOptions`; prefetched in the route loader via
  `ensureQueryData` and consumed with `useSuspenseQuery`.
- `src/components/` — `ui/` Zenit atoms, `therapist/` cards + availability,
  `map/` stylized map, `booking/` bottom sheet, `shell/` header/frame, and
  `MilanApp.tsx` (state container, decoupled from the data layer for testing).
- `src/components/icon/` — only the ~10 Zenit glyphs the app uses, as inline SVG
  (no `dangerouslySetInnerHTML`, no 134KB registry).
