# Changelog

All notable changes to the **Zen Flip Clock & Prayer Times** project will be documented in this file.  
Format pencatatan mengacu pada [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) dan [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-12

### 🇬🇧 English

#### ✨ Added
- **3D Zen Flip Clock**: Retro-modern 3D mechanical flip clock with smooth card flip animations and localized date display.
- **Automated Islamic Prayer Times**:
  - High-precision calculation powered by the astronomical library `adhan`.
  - Automatic geolocation detection with smart IP reverse lookup and OpenStreetMap reverse geocoding fallback.
  - Compact prayer pill display with countdown to the next prayer.
- **Interactive Prayer Popover**: Hover popover displaying the complete daily prayer schedule (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) and detected location district.
- **Pomodoro Timer**:
  - Dedicated Work mode (25m) and Break mode (5m).
  - Clean flip countdown display with interactive Start, Pause, and Reset controls.
  - Dynamic browser tab title updating remaining time: `(24:59) Work - Zen Clock`.
- **Progressive Web App (PWA) & Offline Mode**:
  - Complete `manifest.webmanifest` configuration with HD icons (192x192, 512x512, maskable, and Apple Touch Icon).
  - Service Worker (`sw.js`) for static asset caching and instant offline access.
  - Interactive **Install** prompt button in the navigation header on PWA-supported browsers.
- **Universal Notification & Sound Alert**:
  - Native window notifications for VS Code / Antigravity IDE.
  - Web Browser Notification API + Web Audio API synthesizer chime sound on prayer arrival and timer completion.
- **VS Code Extension Integration**: Contributes `zen-clock-sidebar` activity bar container and `extension-clock.openClock` command.
- **Native VS Code City Selection**: Interactive QuickPick city selector (`extension-clock.changeLocation`) accessible directly by clicking the location name or via Command Palette, supporting popular Indonesian cities and global search.
- **Bottom Panel Integration & Startup Activation**: Runs automatically upon VS Code launch (`onStartupFinished`) and provides a full-featured bottom panel view (`zen-clock-panel-view`) alongside Terminal and Output.
- **Interactive Status Bar Item & Rich Tooltip**: Real-time status bar display showing the current clock, upcoming prayer time, and active Pomodoro countdown. Hovering reveals a rich Markdown tooltip with today's complete prayer schedule, Pomodoro timer state, and quick navigation links.
- **Real Live Screenshots**: Authentic browser and IDE interface screenshots added directly to `README.md`.

#### 🐛 Fixed
- **Extension Host Bundling with esbuild**: Fixed missing runtime dependency (`adhan`) in packaged `.vsix` by bundling `src/extension.ts` with `esbuild`. Resolves `command not found` errors upon activation.
- **Prayer Popover Positioning**: Fixed the prayer schedule popover jumping to the top of the viewport by adding `position: relative` to the parent container, setting centered coordinates (`left: 50%`), and adding an anti-flicker hover bridge (`::after`).

---

### 🇮🇩 Bahasa Indonesia

#### ✨ Fitur Baru (Added)
- **3D Zen Flip Clock**: Jam mekanik flip 3D retro-modern dengan kartu animasi halus dan tampilan tanggal berbahasa Indonesia.
- **Jadwal Sholat Otomatis**:
  - Perhitungan waktu sholat akurat berbasis pustaka astronomi `adhan`.
  - Deteksi lokasi otomatis via browser Geolocation dengan fallback cerdas IP reverse lookup dan OpenStreetMap.
  - Tampilan *pill* ringkas untuk waktu sholat terdekat dengan hitung mundur dinamis.
- **Interactive Prayer Popover**: Hover popover yang menampilkan daftar lengkap seluruh waktu sholat harian (Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya) dan nama wilayah deteksi lokasi.
- **Pomodoro Timer**:
  - Mode fokus kerja (*Work 25m*) dan istirahat (*Break 5m*).
  - Tampilan angka flip dan kontrol *Start*, *Pause*, dan *Reset*.
  - Pembaruan judul tab browser secara dinamis `(24:59) Work - Zen Clock`.
- **Progressive Web App (PWA) & Offline Mode**:
  - Konfigurasi `manifest.webmanifest` lengkap dengan ikon HD (192x192, 512x512, maskable, dan Apple Touch Icon).
  - Service Worker (`sw.js`) untuk caching aset statis dan akses offline secara instan.
  - Tombol **Install** interaktif di bar navigasi saat dibuka di browser yang mendukung PWA.
- **Universal Notification & Sound Alert**:
  - Notifikasi native window untuk VS Code / Antigravity IDE.
  - Web Browser Notification API + Web Audio API synthesizer chime sound saat waktu sholat tiba atau sesi timer selesai.
- **VS Code Extension Integration**: Kontribusi sidebar view container `zen-clock-sidebar` dan command `extension-clock.openClock`.
- **Native VS Code City Selection**: Pemilihan kota interaktif (`extension-clock.changeLocation`) via QuickPick native VS Code dengan klik nama lokasi atau Command Palette.
- **Integrasi Bottom Panel & Auto-Start Saat Startup**: Otomatis aktif saat VS Code dibuka (`onStartupFinished`) serta menyediakan tab di panel bawah (`zen-clock-panel-view`) sejajar dengan Terminal dan Output.
- **Status Bar Interaktif & Hover Tooltip**: Penunjuk status bar real-time yang menampilkan jam, waktu sholat berikutnya, atau countdown Pomodoro. Saat di-hover, menampilkan tooltip Markdown informatif berisi jadwal sholat lengkap hari ini, status Pomodoro, dan shortcut cepat.
- **Live Browser Screenshots**: Dokumentasi antarmuka aplikasi nyata langsung di `README.md`.

#### 🐛 Perbaikan Bug (Fixed)
- **Extension Host Bundling dengan esbuild**: Memperbaiki modul dependency (`adhan`) yang hilang pada file paket `.vsix` dengan mem-bundle `src/extension.ts` menggunakan `esbuild`. Menyelesaikan error `command not found` saat extension diaktifkan.
- **Prayer Popover Positioning**: Memperbaiki masalah popup detail waktu sholat yang melompat ke posisi terlalu atas layar dengan menambahkan `position: relative` pada kontainer induk, koordinat terpusat `left: 50%`, dan jembatan hover anti-flicker `::after`.

---

[1.0.0]: https://github.com/lutfialdrii/zen-clock/releases/tag/v1.0.0
