# Iris Frontend — Architecture

## Technology Stack

| Concern | Library / Tool |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Build tool | Vite 6 |
| Desktop shell | Electron 35 |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui (Radix UI) |
| Animations | Framer Motion 11 |
| Data fetching | TanStack React Query 5 |
| Routing | Wouter (hash-based for Electron) |
| Icons | Lucide React |

---

## Directory Layout

```
irisFrontendApp/
├── electron/               # Electron main process + preload
│   ├── main.js             # Window creation, deep-link handling
│   └── preload.js          # Exposes irisDesktop bridge to renderer
├── public/                 # Static assets served as-is
│   ├── icon.png            # App icon (used by IrisLogo component)
│   └── IrisPlanet.png, EmailOverloadVisualIris.png
├── src/
│   ├── App.tsx             # Router + QueryClientProvider + AuthProvider
│   ├── main.tsx            # ReactDOM.createRoot entry point
│   ├── index.css           # Tailwind directives + CSS custom properties (dark/light theme)
│   ├── global.d.ts         # Window.irisDesktop type declaration
│   ├── pages/              # One file per route
│   ├── components/         # Reusable UI components
│   │   └── ui/             # shadcn/ui primitives (generated, minimal customisation)
│   ├── hooks/              # Data hooks
│   ├── lib/                # Pure utilities (no React)
│   ├── context/            # React contexts
│   ├── types/              # Shared TypeScript interfaces
│   └── constants/          # Static lookup data
├── docs/                   # Developer documentation
├── .env.development        # Local backend URL
├── .env.production         # Production backend URL
└── vite.config.ts          # Vite config (base: "./", Electron CORS fix)
```

---

## Routing

Wouter is used with hash-based routing (`#/home`, `#/emails`) because Electron serves from `file://` — path-based routing would require a web server.

Routes are defined in `src/App.tsx`. The main routes are:

| Path | Component | Auth required |
|---|---|---|
| `/` | Redirect → `/home` or `/login` | — |
| `/home` | `HomePage` | Yes |
| `/emails` | `EmailsPage` | Yes |
| `/login` | `LoginPage` | No |
| `/signup` | `SignupPage` | No |
| `/begin` | `IrisSignupName` | No |
| `/profile-choose` | `ProfileChoosePage` | No |
| `/connect-app` | `ConnectAppPage` | No |
| `/dashboard` | `DashboardUserPage` | No |

---

## State Management

### AuthContext (`src/context/AuthContext.tsx`)

Single global context providing:
- `user` — authenticated user object (or `null`)
- `isIrisActive` / `setIsIrisActive` — Iris on/off toggle (persisted to backend)
- `emailCount` / `setEmailCount` — unread count for sidebar badge
- `logout()` — clears session and redirects to login
- `updateProfile()` — patches user profile via API

### React Query

All server state (emails, connection status) is managed by React Query. Cache keys follow the pattern `["emails", page]`, `["gmail-connection"]`, etc. `src/lib/queryClient.ts` configures the shared instance.

### Local state

Component-level `useState` for UI state (selected email, panel mode, tab). No Redux or Zustand — the app is simple enough that context + React Query covers all needs.

---

## Data Flow: Email Feed

```
useEmailFeed (src/hooks/useEmailFeed.ts)
  └── useInfiniteQuery → GET /emails?page=N&provider=...
        └── returns EmailItem[]
              └── EmailsPage filters by activeTab (category)
                    └── EmailCard renders each item
                          └── QuickAction renders category-specific buttons
                                └── apiFetch POST /calendar/confirm/:id
                                    apiFetch POST /emails/summarize
                                    apiFetch POST /suggest-inline
```

`useEmailFeed` uses cursor-based infinite scroll. The `sentinelRef` div at the bottom of the list triggers `fetchNextPage` via `IntersectionObserver`.

---

## API Layer (`src/lib/api.ts`)

`apiFetch<T>(path, options?)` — thin wrapper around `fetch`:
- Prepends `VITE_API_URL` (injected by Vite from the active `.env` file)
- Attaches the JWT from `localStorage` as `Authorization: Bearer ...`
- Throws on non-2xx responses with the backend error message

---

## Electron Bridge (`window.irisDesktop`)

`electron/preload.js` exposes a limited API to the renderer via `contextBridge`:

```ts
window.irisDesktop = {
  openExternal(url: string): void   // open OAuth URLs in system browser
  onDeepLink(cb): void              // receive OAuth callback deep-links
}
```

This allows the renderer to trigger OAuth flows that redirect back to the Electron app via a custom `iris://` URL scheme.

---

## Theme System

CSS custom properties are defined in `src/index.css` for both dark (default) and light modes. Tailwind reads them via `hsl(var(--background))` etc. The `ThemeProvider` component toggles a `dark` / `light` class on `<html>`.

All hardcoded colors in components use the `#E8842A` / `#f97316` orange palette for Iris branding. Avoid hardcoded white/black — prefer `hsl(var(--foreground))` and `hsl(var(--background))` for theme compatibility.

---

## Sound System

`src/lib/sounds.ts` exports three Web Audio API functions (`playPop`, `playSettingsPanelPop`, `playDotsClick`). Each function creates a fresh `AudioContext`, synthesizes a short frequency sweep, and disposes immediately. No audio files are used. The pattern ensures sounds work even in Electron's sandboxed renderer without bundling audio assets.

---

## Build Pipeline

```
npm run electron:build
  └── tsc -b          (type-check + emit declarations)
  └── vite build      (bundle to dist/ with base "./")
  └── electron-builder (wrap dist/ + electron/ into platform installers)
        └── Mac: .dmg in release/
        └── Windows: .exe (NSIS) in release/
        └── Linux: .AppImage in release/
```

The GitHub Actions release workflow runs this on Mac and Windows runners in parallel, then attaches both artifacts to a GitHub Release.
