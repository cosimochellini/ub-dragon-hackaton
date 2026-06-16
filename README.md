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
TypeScript · ESLint (hardened — see [Linting](#linting)) · Vitest + Testing
Library. Design tokens from Unobravo's **Zenit 2.0** system.

## Requirements

Node **≥ 22.12** (see `.nvmrc`).

### Environment

| Variable        | Default                        | Purpose                                                                       |
| --------------- | ------------------------------ | ----------------------------------------------------------------------------- |
| `VITE_SITE_URL` | `https://ub-dragon.netlify.app` | Absolute origin for the canonical URL and Open Graph / Twitter image. Set it in the Netlify site environment to match the deployed domain. |

## SEO & favicon

The HTML `<head>` (in `src/routes/__root.tsx`) carries the title, description,
canonical URL, favicons, theme color, web-app manifest, and the full Open
Graph + Twitter card set. The favicon (`favicon.svg` / `favicon.ico`),
PWA/touch icons (`logo192.png`, `logo512.png`, `apple-touch-icon.png`), and the
1200×630 social-share image (`og-image.png`) all live in `public/` and are
generated from the Unobravo brand mark in `public/logo-unobravo-black.svg`.

Because this POC is seeded with **mock** therapist data, it is marked
`noindex, nofollow` via a page-level robots `<meta>` tag so it is not indexed
under the real Unobravo brand. (A Netlify `X-Robots-Tag` header is deliberately
avoided: `[[headers]]` rules don't apply to the catch-all-redirect HTML served
by the SSR function, so the meta tag — rendered into every SSR response — is the
authoritative signal.) `robots.txt` stays crawlable on purpose so the `noindex`
directive is actually read; social link previews still work.

## Scripts

```bash
npm install
npm run dev        # dev server at http://localhost:3000
npm run build      # production build (client + SSR)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint (see Linting below)
npm run test       # vitest (unit + booking-flow integration)
npm run react-doctor  # full React Doctor scan (scoring + report), on demand
```

## Linting

ESLint is configured for **strong, React-aware correctness**, not just style. On
top of the TanStack base config (`typescript-eslint`, `import-x`, `n`,
`@stylistic`) the flat config (`eslint.config.js`) layers four React-focused
plugins, each at its recommended preset:

| Plugin | What it enforces |
| --- | --- |
| [`eslint-plugin-react-doctor`](https://react.doctor) | Security / performance / a11y / architecture, plus the **TanStack Start** and **TanStack Query** rule packs. |
| [`eslint-plugin-react-hooks`](https://react.dev/reference/eslint-plugin-react-hooks) (v7) | Rules of Hooks + the React Compiler lints. |
| [`@eslint-react/eslint-plugin`](https://eslint-react.xyz) | Deep, type-aware React 19 correctness rules. |
| [`eslint-plugin-unicorn`](https://github.com/sindresorhus/eslint-plugin-unicorn) | Strong, framework-agnostic JS/TS hardening. |

A small set of rules is deliberately turned off (each with an inline rationale in
`eslint.config.js`) where it fights this project's idioms — e.g. `unicorn/no-null`
(`null` is idiomatic for refs/DOM/JSON), `unicorn/no-nested-ternary` (Prettier owns
ternary formatting), and the React-Compiler memoization rule (the compiler isn't
enabled here). React rules lint `src/**/*.{ts,tsx}`; the generated `routeTree.gen.ts`
is ignored.

`react-doctor` is the same rule set as a full CLI scan (scoring + report);
`npm run react-doctor` runs it on demand. CI (`.github/workflows/ci.yml`) gates every
PR on `lint` + `typecheck` + `test`.

## Architecture

- `src/data/therapists.json` — **mock data** (4 studios, 6 therapists). Availability
  is stored as a 7‑day offset pattern (`dayOffset 1..7 → ["HH:MM", …]`, starting
  tomorrow — same‑day booking is excluded). **This is
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
