# Changelog

Semua perubahan penting pada proyek **Zen Flip Clock & Prayer Times** akan didokumentasikan dalam file ini.

Format pencatatan mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.1.0/) dan proyek ini mematuhi [Semantic Versioning (SemVer)](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-12

### ✨ Fitur Baru (Added)
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
- **Live Browser Screenshots**: Dokumentasi antarmuka aplikasi nyata langsung di `README.md`.

### 🐛 Perbaikan Bug (Fixed)
- **Prayer Popover Positioning**: Memperbaiki masalah popup detail waktu sholat yang melompat ke posisi terlalu atas layar dengan menambahkan `position: relative` pada kontainer induk, koordinat terpusat `left: 50%`, dan jembatan hover anti-flicker `::after`.

---

[1.0.0]: https://github.com/lutfialdrii/zen-clock/releases/tag/v1.0.0
