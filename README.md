# Iris - AI Email & Calendar App

Iris is an AI-powered desktop app that extracts important appointment emails and adds them to your calendar automatically.

---

## English

### Requirements

- [Node.js](https://nodejs.org/) v20+
- npm

### Environment Setup

The app connects to a backend API. You need two env files in the project root before running:

**`.env.development`** — used automatically by `npm run electron:dev`:
```
VITE_API_URL=http://localhost:8000
```

**`.env.production`** — used automatically by `npm run electron:build`:
```
VITE_API_URL=https://irisbackend-ar0m.onrender.com
```

A [.env.example](.env.example) file is included in the repo as a reference. Vite handles switching between the two automatically — no manual changes needed.

### Install & Run

```bash
# 1. Clone the repo
git clone https://github.com/Jerobel05/iris-app
cd iris-app

# 2. Set up environment files (see Environment Setup above)
cp .env.example .env.development
# then edit .env.development with your local backend URL

# 3. Install dependencies
npm install

# 3a. Run in the browser (web dev mode)
npm run dev
# → Opens at http://localhost:5173

# 3b. Run as a desktop app (Electron)
npm run electron:dev
# → Opens a native desktop window
```

### Build

```bash
# Build the web app only
npm run build

# Build the desktop installer (outputs to /release)
npm run electron:build
```

> Building on Mac produces a `.dmg`. Building on Windows produces a `.exe`.
> For distributing both, use the GitHub Actions release workflow (see below).

### Troubleshooting

If you get an error about native modules (`@rollup/rollup-darwin-arm64` etc.):

```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Repository Rules

#### Branches

| Branch | Purpose | Direct commits |
|---|---|---|
| `main` | Production — stable, released code | Blocked |
| `develop` | Integration — ongoing work | Blocked |
| `feature/*` | New features | Allowed |

All changes to `main` and `develop` must go through a **pull request**.

#### Recommended workflow

1. Branch off `develop`: `git checkout -b feature/your-feature develop`
2. Make your changes and commit
3. Open a PR to `develop` — Copilot will review automatically
4. Once stable, open a PR from `develop` → `main`

#### Workflows

| Workflow | Trigger | What it does |
|---|---|---|
| **Auto Tag** | Push to `main` | Automatically increments the version tag (e.g. `v1.0.3`) |
| **Release** | New version tag (`v*`) | Builds `.dmg` (Mac) and `.exe` (Windows) via GitHub runners, then publishes a GitHub Release with both installers attached |
| **Dependabot** | Weekly | Opens PRs to update npm packages and GitHub Actions |

#### Releasing a new version

Merging a PR into `main` triggers everything automatically:
1. Auto Tag creates a new version tag
2. Release workflow builds the installers on Mac and Windows runners
3. A GitHub Release is published with the `.dmg` and `.exe` ready to download

---
---

## Français

### Prérequis

- [Node.js](https://nodejs.org/) v20+
- npm

### Configuration de l'environnement

L'application se connecte à un backend. Il faut deux fichiers env à la racine du projet avant de démarrer :

**`.env.development`** — utilisé automatiquement par `npm run electron:dev` :
```
VITE_API_URL=http://localhost:8000
```

**`.env.production`** — utilisé automatiquement par `npm run electron:build` :
```
VITE_API_URL=https://irisbackend-ar0m.onrender.com
```

Un fichier [.env.example](.env.example) est inclus dans le dépôt comme référence. Vite gère le basculement automatiquement — aucune modification manuelle nécessaire.

### Installation & Démarrage

```bash
# 1. Cloner le dépôt
git clone https://github.com/Jerobel05/iris-app
cd iris-app

# 2. Configurer les fichiers d'environnement (voir section ci-dessus)
cp .env.example .env.development
# puis éditer .env.development avec l'URL de votre backend local

# 3. Installer les dépendances
npm install

# 3a. Lancer dans le navigateur (mode web)
npm run dev
# → Disponible sur http://localhost:5173

# 3b. Lancer en application bureau (Electron)
npm run electron:dev
# → Ouvre une fenêtre native sur le bureau
```

### Build

```bash
# Compiler l'application web uniquement
npm run build

# Compiler l'installeur bureau (résultat dans /release)
npm run electron:build
```

> Compiler sur Mac produit un `.dmg`. Sur Windows, un `.exe`.
> Pour distribuer les deux, utiliser le workflow GitHub Actions (voir ci-dessous).

### Dépannage

En cas d'erreur liée aux modules natifs (`@rollup/rollup-darwin-arm64` etc.) :

```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Règles du dépôt

#### Branches

| Branche | Rôle | Commits directs |
|---|---|---|
| `main` | Production — code stable et publié | Bloqués |
| `develop` | Intégration — travail en cours | Bloqués |
| `feature/*` | Nouvelles fonctionnalités | Autorisés |

Toute modification sur `main` et `develop` doit passer par une **pull request**.

#### Workflow recommandé

1. Créer une branche depuis `develop` : `git checkout -b feature/ma-fonctionnalite develop`
2. Faire ses modifications et commiter
3. Ouvrir une PR vers `develop` — Copilot effectue une revue automatiquement
4. Une fois stable, ouvrir une PR de `develop` → `main`

#### Workflows automatiques

| Workflow | Déclencheur | Action |
|---|---|---|
| **Auto Tag** | Push sur `main` | Incrémente automatiquement le tag de version (ex. `v1.0.3`) |
| **Release** | Nouveau tag de version (`v*`) | Compile le `.dmg` (Mac) et le `.exe` (Windows) via les runners GitHub, puis publie une GitHub Release avec les deux installeurs |
| **Dependabot** | Hebdomadaire | Ouvre des PRs pour mettre à jour les packages npm et les GitHub Actions |

#### Publier une nouvelle version

Merger une PR dans `main` déclenche tout automatiquement :
1. Auto Tag crée un nouveau tag de version
2. Le workflow Release compile les installeurs sur des runners Mac et Windows
3. Une GitHub Release est publiée avec le `.dmg` et le `.exe` prêts à télécharger
