# Zen Flip Clock, Prayer Times & Pomodoro

Aplikasi jam flip animasi (Zen Flip Clock), jadwal sholat otomatis, dan Pomodoro Timer interaktif. Tersedia dalam versi **VS Code / Antigravity IDE Extension** dan **Standalone Web App**.

---

## 🌟 Fitur Utama

1. **Zen Flip Clock**: Jam flip dengan animasi 3D modern & responsif.
2. **Jadwal Sholat Otomatis**: Perhitungan waktu sholat akurat dengan `adhan`, deteksi otomatis via Browser Geolocation & IP Reverse Lookup.
3. **Pomodoro Timer**: Mode kerja (25 menit) & istirahat (5 menit) dengan hitung mundur flip.
4. **Universal Notification & Sound Alert**:
   - Di VS Code: Notifikasi native VS Code window.
   - Di Web Browser: Web Browser Notification + Audio Chime lembut saat waktu sholat atau timer selesai.
   - Update Judul Tab Browser dinamis `(24:59) Work - Zen Clock`.

---

## 💻 1. Versi Web (Standalone App)

### Jalankan Lokal (Development)
```bash
npm run dev
```

### Build untuk Produksi (Web)
```bash
npm run build:web
```
Hasil build web akan tersedia di folder `dist/` dan siap di-deploy ke web hosting mana saja.

### Preview Hasil Build Web
```bash
npm run preview
```

---

## 🚀 Cara Deploy Versi Web

### Option A: Vercel (Rekomendasi - 1 Klik)
1. Install Vercel CLI (atau hubungkan repository di [Vercel Dashboard](https://vercel.com)):
   ```bash
   npx vercel
   ```
2. Atau jalankan di terminal:
   ```bash
   npx vercel --prod
   ```

### Option B: Netlify
1. Build aplikasi: `npm run build:web`
2. Upload / drag-and-drop folder `dist/` ke [Netlify Drop](https://app.netlify.com/drop), atau deploy via Netlify CLI:
   ```bash
   npx netlify deploy --prod --dir=dist
   ```

### Option C: GitHub Pages
1. Install `gh-pages`: `npm install -D gh-pages`
2. Tambahkan script di `package.json`: `"deploy": "npm run build:web && gh-pages -d dist"`
3. Jalankan: `npm run deploy`

---

## 🔌 2. Versi Extension (VS Code / Antigravity IDE)

### Mode Debugging (F5)
1. Buka folder `extension-clock` di VS Code / Antigravity IDE.
2. Tekan `F5` (menu **Run and Debug** -> **Extension**).
3. Buka ikon **Zen Clock** di Activity Bar sebelah kiri.

### Build Package Extension (.vsix)
```bash
npx vsce package
```
Install file `.vsix` melalui menu Extension (`Install from VSIX...`).
