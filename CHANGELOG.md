# Release Notes (Changelog)

All notable public releases and user-facing updates for **Zen Clock: Pomodoro & Muslim Prayer Times** are documented in this file.  
For technical development history, engineering decisions, and prompt trajectory logs, see [docs/DEV_LOG.md](docs/DEV_LOG.md).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.1] - 2026-09-15 — Initial Release

### 🇬🇧 English

#### ✨ Features & Highlights
- **3D Zen Flip Clock**: Retro-modern mechanical flip clock with smooth card flip animations, localized date, and responsive typography scaling for both narrow sidebars and full editor views.
- **Background Pomodoro Timer Engine**:
  - Independent timer loop running in the Extension Host (Node.js) that never freezes when tabs are hidden or inactive.
  - Seamless state synchronization across all views (Sidebar, Bottom Panel, and Full Editor).
  - Native OS completion notifications and warning confirmations to prevent accidental timer resets.
- **Automated Islamic Prayer Times (Kemenag RI Standard)**:
  - Astronomical prayer calculation powered by `adhan` library with Indonesian Ministry of Religious Affairs (Kemenag RI) standard parameters (Fajr 20°, Isha 18°, +2 minutes ihtiyat correction).
  - Interactive minute adjustments menu (`extension-clock.adjustPrayerTimes`) for custom calibration.
  - Global city search and curated Indonesian popular cities selection.
- **Multi-Language Support (i18n)**:
  - Full bilingual support with Bahasa Indonesia as default and English as an optional setting (`zenClock.language`).
  - Added new Command Palette shortcut `Zen Clock: Display: Switch Language (Ganti Bahasa)` (`extension-clock.changeLanguage`) to toggle languages on the fly.
  - Reactive language synchronization across Status Bar tooltip, native notifications, QuickPick dialogs, FlipClock date formatting, and the dedicated prayer reminder tab.
- **Harmonized Accent Color System**:
  - 6 curated aesthetic themes: Warm Amber (Default), Islamic Emerald, Modern Sky Cyan, Pomodoro Rose, Mystic Purple, and Monochrome Silver.
  - Custom HEX color input with automated contrast detection and subtle glow effects.
- **Interactive Status Bar Item & Clean Hover Tooltip**:
  - Compact right-aligned status bar indicator showing current clock, next prayer, or live Pomodoro countdown.
  - Clicking the widget opens and focuses the Zen Clock Sidebar.
  - Rich, beautifully padded hover tooltip displaying today's complete prayer schedule, next prayer countdown highlight, and quick settings links.
- **Dedicated Prayer Reminder Tab**: Peaceful, calming editor tab reminder that opens automatically when prayer time arrives, displaying Quranic verses and quick navigation.

---

### 🇮🇩 Bahasa Indonesia

#### ✨ Fitur Utama (Initial Release)
- **3D Zen Flip Clock**: Jam mekanik flip 3D retro-modern dengan kartu animasi halus, tampilan tanggal berbahasa Indonesia/Inggris dinamis, dan skala tipografi responsif yang rapi di panel samping maupun tab penuh.
- **Background Pomodoro Timer Engine**:
  - Timer berjalan mandiri di background Extension Host (Node.js), tidak akan freeze atau terhenti saat tab VS Code diminimize atau tidak aktif.
  - Sinkronisasi state otomatis ke seluruh tampilan aktif (Sidebar, Bottom Panel, dan Editor).
  - Notifikasi suara dan peringatan konfirmasi saat berganti mode agar sesi kerja tidak ter-reset secara tidak sengaja.
- **Jadwal Sholat Otomatis Standar Kemenag RI**:
  - Perhitungan waktu sholat akurat berbasis pustaka astronomi `adhan` dengan parameter resmi Kementerian Agama Republik Indonesia (Subuh 20°, Isya 18°, +2 menit ihtiyat).
  - Menu QuickPick interaktif penyesuaian koreksi menit sholat (+/- menit per jadwal).
  - Pencarian kota global dan daftar kota populer di Indonesia.
- **Dukungan Multi-Bahasa (i18n)**:
  - Dukungan dwibahasa penuh dengan Bahasa Indonesia sebagai bawaan dan Bahasa Inggris sebagai opsi pengaturan (`zenClock.language`).
  - Shortcut Command Palette baru `Zen Clock: Display: Switch Language (Ganti Bahasa)` (`extension-clock.changeLanguage`) untuk mengganti bahasa secara instan.
  - Sinkronisasi reaktif ke seluruh tooltip status bar, notifikasi native OS, dialog prompt, format tanggal jam, dan tab pengingat sholat.
- **Harmonisasi Warna Tema & Kustomisasi HEX**:
  - 6 preset warna pilihan: Warm Amber (Default), Islamic Emerald, Modern Sky Cyan, Pomodoro Rose, Mystic Purple, dan Monochrome Silver.
  - Dukungan kode warna HEX kustom dengan kalkulasi otomatis kontras teks dan efek pendar halus.
- **Widget Status Bar Interaktif & Tooltip Rapi**:
  - Penunjuk waktu di bar status kanan bawah VS Code. Klik widget untuk membuka sidebar Zen Clock.
  - Hover tooltip Markdown elegan berisi jadwal sholat lengkap hari ini, highlight countdown waktu sholat berikutnya, dan menu pengaturan cepat.
- **Tab Pengingat Sholat Khusus (Prayer Reminder Page)**: Tab editor estetik dan menenangkan yang otomatis terbuka saat waktu sholat tiba, dilengkapi ayat pengingat dan tombol aksi cepat.

---

[0.0.1]: https://github.com/lutfialdrii/zen-clock/releases/tag/v0.0.1
