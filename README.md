# Iris - AI Email & Calendar App

Iris is an AI-powered app that extracts important appointment emails and adds them to your calendar automatically.

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/Jerobel05/iris-app
cd iris-app

# 2. Install dependencies (remove any previous install first)
rm -rf node_modules package-lock.json
npm install

# 3. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for production

```bash
npm run build
npm run preview
```

## Troubleshooting

If you get an error about `@rollup/rollup-darwin-arm64` or similar native modules, run:

```bash
rm -rf node_modules package-lock.json
npm install
```




## Repository Rules & Workflow

### Branch Protection

- **`main` branch**: All changes must be merged via pull request. Direct commits are blocked.
- **`develop` branch**: All changes must be merged via pull request. Direct commits are blocked.

### Code Review

- **GitHub Copilot** automatically reviews all pull requests and provides AI-powered code feedback before merging.
- Reviews are optional (not enforced as required) but are highly recommended.

### Dependency Management

- **Dependabot** is enabled for:
  - **npm**: Weekly checks for NPM package updates (max 10 open PRs, auto-labels: `dependencies`, `npm`)
  - **GitHub Actions**: Weekly checks for action updates (max 5 open PRs, auto-labels: `dependencies`, `github-actions`)

### Screenshots

- A screenshot is automatically captured whenever a pull request is merged into `main`.

### Recommended Workflow

1. Create a feature branch from `develop`: `git checkout -b feature/your-feature develop`
2. Make your changes and commit
3. Push your branch and open a pull request to `develop`
4. Wait for Copilot review and merge
5. When ready to release, open a PR from `develop` to `main`
6. After merging to `main`, a screenshot is captured and the deployment is updated
