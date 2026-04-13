# German Word Cloud Generator

Live here: https://ivoleist.github.io/word-cloud-generator

A React + Vite app for generating German word clouds from typed text or uploaded `.txt` / `.docx` files.

## Requirements

- Node.js 18+
- npm

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Install dependencies:

```bash
npm install
```

3. Deploy:

```bash
npm run deploy
```

This publishes the built `dist/` folder to the `gh-pages` branch.

4. In your GitHub repository, go to **Settings -> Pages** and set:
   - **Source**: `Deploy from a branch`
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`

After saving, GitHub Pages will serve your app.
