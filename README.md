# ⏰ Zen Flip Clock, Prayer Times & Pomodoro

<p align="center">
  <img src="./assets/preview-extension-full.png" alt="Zen Flip Clock & Prayer Times Preview" width="100%" />
</p>

<p align="center">
  <b>Minimalist 3D Retro Flip Clock, Automated Islamic Prayer Times & Pomodoro Timer</b><br />
  Available as a standalone <b>Progressive Web App (PWA)</b> and a <b>VS Code / Antigravity IDE Extension</b>.
</p>

<p align="center">
  <b>English</b> | <a href="./README.id.md">Bahasa Indonesia</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PWA-Supported-5a0fc8?logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/VS_Code-Extension-007acc?logo=visualstudiocode&logoColor=white" alt="VS Code Extension" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## 📸 Interface Gallery (Live Screenshots)

### 🔌 1. Extension Mode (VS Code & Antigravity IDE)

| Sidebar View | Full Editor Panel Tab |
| :---: | :---: |
| <img src="./assets/preview-extension.png" alt="Zen Clock Sidebar View" width="100%" /> | <img src="./assets/preview-extension-full.png" alt="Zen Clock Full Tab View" width="100%" /> |

### 🌐 2. Standalone Web & Progressive Web App (PWA) Mode

| Prayer Times & Schedule Popover | Pomodoro Timer |
| :---: | :---: |
| <img src="./assets/preview-hover.png" alt="Prayer Times Schedule Popover" width="100%" /> | <img src="./assets/preview-pomodoro.png" alt="Pomodoro Timer" width="100%" /> |

---

## 🌟 Key Features

- **🕰️ 3D Zen Flip Clock**: Mechanical retro-modern flip clock with smooth 3D flip card animations and localized date display.
- **🕌 Automated Islamic Prayer Times**:
  - High-precision prayer times calculation powered by astronomical library [`adhan`](https://github.com/batoulapps/adhan-js).
  - Automatic geolocation detection with smart IP Reverse Lookup & OpenStreetMap fallback.
  - Interactive hover popover displaying the full daily prayer schedule (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha).
- **🍅 Pomodoro Timer**:
  - Work mode (25m) and Break mode (5m) with flip digit countdown.
  - Interactive start, pause, and reset controls.
  - Dynamic browser tab title updating remaining time: `(24:59) Work - Zen Clock`.
- **📱 Progressive Web App (PWA) & Offline Mode**:
  - Fully installable on Desktop (Chrome, Edge, macOS/Windows) and Mobile (Android & iOS).
  - Smart Service Worker caching for instant offline load.
  - In-app interactive **Install** button on the navigation bar.
- **🔔 Universal Notification & Sound Alert**:
  - Native window notifications in VS Code / Antigravity IDE extension.
  - Web Browser Notification API + Web Audio API synthesizer chime sound when prayer time arrives or timer ends.

---

## 🚀 1. Running Web & PWA Version

### Development Mode
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### Production Build (Web)
```bash
npm run build:web
```
Ready-to-deploy static assets will be output in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

### 📲 How to Install the App (PWA)
- **Desktop (Chrome / Edge / Brave)**: Click the **Install** button on the in-app navigation bar or the install icon in the browser address bar.
- **Android**: Open in Chrome $\rightarrow$ Click **Install** or tap the menu $\rightarrow$ *Add to Home screen*.
- **iOS / iPadOS (Safari)**: Open in Safari $\rightarrow$ Tap the **Share** button $\rightarrow$ Select ***Add to Home Screen***.

---

## 🌐 Web Deployment Guide

### Option 1: Vercel (Recommended)
1. Import this repository in [Vercel Dashboard](https://vercel.com).
2. Or deploy via Vercel CLI:
   ```bash
   npx vercel --prod
   ```

### Option 2: Netlify
1. Build the web app:
   ```bash
   npm run build:web
   ```
2. Upload the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop), or deploy via Netlify CLI:
   ```bash
   npx netlify deploy --prod --dir=dist
   ```

### Option 3: GitHub Pages
1. Install deployment dependency:
   ```bash
   npm install -D gh-pages
   ```
2. Add script to `package.json`:
   ```json
   "deploy": "npm run build:web && gh-pages -d dist"
   ```
3. Run:
   ```bash
   npm run deploy
   ```

---

## 🔌 2. Running VS Code / Antigravity IDE Extension

### Local Debugging (F5)
1. Open the project folder in VS Code or Antigravity IDE.
2. Press `F5` or navigate to **Run and Debug** $\rightarrow$ Select **Extension**.
3. Click the **Zen Clock** icon in the Activity Bar on the left.

### Package Extension (.vsix)
```bash
npm run package:vsix
```
Install the generated `.vsix` file via Extensions menu (`...` $\rightarrow$ `Install from VSIX...`).

---

## 🛠️ Tech Stack

- **Frontend Core**: React 19, JavaScript (ESNext)
- **Bundler & Tooling**: Vite 8, TypeScript
- **PWA**: Service Worker Cache API, Web App Manifest
- **Prayer Calculation**: Adhan JS
- **Icons**: Lucide React
- **Extension API**: VS Code Webview API

---

## 📄 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for details.
