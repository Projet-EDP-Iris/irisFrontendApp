# Iris — AI Email & Calendar Desktop App

Iris is an AI-powered Electron desktop app that reads your emails, detects appointments, sorts messages into smart categories, and lets you act on them directly — confirm a meeting, summarize a thread, or copy a promo code in one click.

> **Backend repo:** [irisBackend](https://github.com/Jerobel05/irisBackend) — FastAPI + Python NLP pipeline

---

## English

### Requirements

- [Node.js](https://nodejs.org/) v20+
- npm

### Environment Setup

The app connects to a backend API. Create two env files in the project root:

**`.env.development`** — used by `npm run electron:dev`
```
VITE_API_URL=http://localhost:8000
```

**`.env.production`** — used by `npm run electron:build`
```
VITE_API_URL=https://irisbackend-ar0m.onrender.com
```

A [.env.example](.env.example) reference file is included. Vite switches between them automatically.

### Install & Run

```bash
git clone https://github.com/Jerobel05/iris-app
cd iris-app
npm install

# Web dev mode (browser)
npm run dev             # → http://localhost:5173

# Desktop app (Electron)
npm run electron:dev    # → native window
```

### Build

```bash
npm run build           # web only
npm run electron:build  # desktop installer → /release
```

> Mac → `.dmg` · Windows → `.exe` · Linux → `.AppImage`
> For cross-platform builds use the GitHub Actions release workflow.

### Project Structure

```
src/
├── pages/          # Route-level views (home, emails, login, signup/*)
├── components/     # Shared UI components + Radix/shadcn primitives (components/ui/)
├── hooks/          # Data-fetching hooks (useEmailFeed, useGmailConnection, …)
├── lib/            # Utilities: api.ts, sounds.ts, version.ts, signupDraft.ts
├── context/        # AuthContext — user session + Iris active state
├── types/          # Shared TypeScript interfaces (EmailItem, …)
└── constants/      # Static data (profileIcons)

electron/           # Electron main process + preload scripts
public/             # Static assets (icons, images)
docs/               # Feature & architecture documentation
```

### Architecture

| Layer | Technology |
|---|---|
| UI framework | React 18 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix UI) |
| Animations | Framer Motion |
| Data fetching | TanStack React Query |
| State | AuthContext (user session, Iris toggle) |
| Desktop shell | Electron — wraps the Vite SPA in a native window |
| Backend comms | REST via `src/lib/api.ts` (`apiFetch`) |

**Key data flow:**
`useEmailFeed` (React Query + cursor pagination) → `EmailsPage` → `EmailCard` → `QuickAction` buttons

**Routing:** Wouter hash-based (`#/home`, `#/emails`, `#/login`, …)

**Sound system:** Web Audio API oscillator synthesis in `src/lib/sounds.ts` — no audio files, respects the Sound toggle in Settings.

**Electron / Vite path note:** `vite.config.ts` sets `base: "./"` for `file://` compatibility. All asset paths must be relative (e.g. `./icon.png`, not `/icon.png`).

### Code Style

- **Tailwind for all styling** — inline styles only for dynamic values (e.g. computed `boxShadow`).
- **No comments on what code does** — only comments for non-obvious WHY (hidden constraint, workaround, invariant).
- **No unused imports** — TypeScript strict mode is on.
- **Framer Motion** for any animation beyond simple CSS transitions.
- **No console.log** in committed code.

### Troubleshooting

**Native module errors** (`@rollup/rollup-darwin-arm64` etc.):
```bash
rm -rf node_modules package-lock.json && npm install
```

**Blank window in Electron dev:** ensure the Vite dev server (`npm run dev`) is running first.

**OAuth redirect not working locally:** the backend must be running on `http://localhost:8000` and the callback URL must be registered in Google/Microsoft developer consoles.

---

### Repository Rules

#### Branches

| Branch | Purpose | Direct commits |
|---|---|---|
| `main` | Production — stable released code | Blocked |
| `develop` | Integration — ongoing work | Blocked |
| `feat/*` | New features | Allowed |
| `fix/*` | Bug fixes | Allowed |
| `chore/*` | Maintenance | Allowed |

All changes to `main` and `develop` must go through a **pull request**.

#### Workflow

1. Branch off `develop`: `git checkout -b feat/your-feature develop`
2. Commit and push
3. Open a PR to `develop`
4. Once stable, merge `develop` → `main`

#### Automated Workflows

| Workflow | Trigger | Action |
|---|---|---|
| **Auto Tag** | Push to `main` | Increments version tag (`v1.0.x`) |
| **Release** | New version tag | Builds `.dmg` + `.exe` on GitHub runners, publishes GitHub Release |
| **Dependabot** | Weekly | Opens PRs for npm + Actions updates |

---

## Français

### Prérequis

- [Node.js](https://nodejs.org/) v20+
- npm

### Configuration de l'environnement

L'application se connecte à un backend. Créez deux fichiers env à la racine :

**`.env.development`** — utilisé par `npm run electron:dev`
```
VITE_API_URL=http://localhost:8000
```

**`.env.production`** — utilisé par `npm run electron:build`
```
VITE_API_URL=https://irisbackend-ar0m.onrender.com
```

Un fichier [.env.example](.env.example) de référence est inclus dans le dépôt.

### Installation & Démarrage

```bash
git clone https://github.com/Jerobel05/iris-app
cd iris-app
npm install

npm run dev             # mode web → http://localhost:5173
npm run electron:dev    # application bureau
```

### Build

```bash
npm run build           # web uniquement
npm run electron:build  # installeur bureau → /release
```

### Structure du projet

```
src/
├── pages/          # Vues principales (accueil, emails, login, inscription)
├── components/     # Composants UI partagés + primitives shadcn/ui
├── hooks/          # Hooks de données (useEmailFeed, useGmailConnection, …)
├── lib/            # Utilitaires : api, sons, version, brouillon inscription
├── context/        # AuthContext — session utilisateur + état Iris
├── types/          # Interfaces TypeScript partagées
└── constants/      # Données statiques (icônes de profil)
```

### Règles du dépôt

#### Branches

| Branche | Rôle | Commits directs |
|---|---|---|
| `main` | Production — code stable et publié | Bloqués |
| `develop` | Intégration — travail en cours | Bloqués |
| `feat/*` | Nouvelles fonctionnalités | Autorisés |
| `fix/*` | Corrections | Autorisés |

#### Workflows automatiques

| Workflow | Déclencheur | Action |
|---|---|---|
| **Auto Tag** | Push sur `main` | Incrémente le tag de version |
| **Release** | Nouveau tag | Compile `.dmg` + `.exe`, publie une GitHub Release |
| **Dependabot** | Hebdomadaire | PRs de mise à jour npm et Actions |
