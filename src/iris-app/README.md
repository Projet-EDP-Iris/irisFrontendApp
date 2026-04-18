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
