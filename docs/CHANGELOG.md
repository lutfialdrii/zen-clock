# Changelog

Semua perubahan penting pada proyek **Zen Flip Clock & Prayer Times (VS Code Extension)** didokumentasikan di file ini secara *reverse-chronological* (terbaru di atas).

Format pencatatan mengacu pada [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) dan aturan kedisiplinan dokumentasi AI.

---

## [Unreleased] - 2026-09-14

### Arsitektur & Tata Kelola
- **Prompt Pengguna:**
  > *"karena saya kesulitannya kita maintain dengan satu codebase, jadi sepertinya perlu kita pisahkan, jadi saya memutuskan untuk fokus di pengembangan extension vscode dan vsix, untuk web sepertinya nanti akan saya fork repo ini atau saya akan init project terbaru untuk fokus ke web development nya saja, tapi dengan branding yang sama.. untuk itu bantu saya agar project yang saat ini kita migrasikan untuk fokus ke extension app development, jadi fokus lah merancang dokumentasinya terlebih dahulu, dan saya perlu tanamkan untuk setiap pengembangan suatu fitur, perlu diberlakukaknnya isosalasi branch. Bagaimana menurutmu?"*
- **Komponen & File Terkait:**
  - `archive/web-pwa-standalone` (Git Branch) & `v1.0.0-web-pwa` (Git Tag): Pengamanan snapshot kode versi web/PWA sebelum spesialisasi ekstensi.
  - `/Users/sm/Documents/Lutfi/DEV/Learn/zen-flip-clock`: Inisialisasi repositori web mandiri lengkap dengan `DELEGATION.md` dan verifikasi build PWA.
  - `docs/ARCHITECTURE.md`: Dokumentasi arsitektur Extension Host First, diagram alir data IPC `postMessage`, dan pembagian tanggung jawab modul.
  - `docs/BRANCHING_STRATEGY.md`: SOP isolasi branch (`feat/*`, `fix/*`), quality gates (`npm run compile`, `npm run build`, `npm run package:vsix`), dan protokol merge.
  - `docs/PROGRESS.md`: Pelacakan milestone teknis proyek dari M0 hingga M5.
  - `docs/CHANGELOG.md`: Inisialisasi dokumen riwayat perubahan.
- **Keputusan Desain & Rationale:**
  - Pemisahan repositori web dan VS Code extension mengeliminasi beban *leaky abstraction* (seperti deteksi environment runtime, mock VS Code di web, atau tombol PWA di dalam extension).
  - Extension Host diposisikan sebagai *single source of truth* untuk background process (Pomodoro timer dan prayer calculation engine) sehingga state tidak terganggu ketika webview di-minimize atau di-dispose oleh VS Code.
  - Aturan isolasi branch menjamin branch `main` selalu berada dalam status siap rilis dan packaging VSIX.
- **Hasil Verifikasi:**
  - Branch arsip dan tag berhasil dibuat di Git.
  - Repositori `zen-flip-clock` berhasil di-build (`npm run build` sukses dalam 349ms, PWA assets valid).
  - Branch kerja saat ini: `docs/extension-first-architecture`.

---

## [1.0.0] - 2026-09-12

### ✨ Fitur Baru (Added)
- **3D Zen Flip Clock**: Jam mekanik flip 3D retro-modern dengan kartu animasi halus dan tampilan tanggal berbahasa Indonesia.
- **Jadwal Sholat Otomatis**: Perhitungan waktu sholat akurat berbasis pustaka astronomi `adhan` dengan fallback lokasi.
- **Pomodoro Timer**: Mode fokus kerja (*Work 25m*) dan istirahat (*Break 5m*).
- **VS Code Extension Integration**: Kontribusi sidebar view `zen-clock-sidebar` dan bottom panel view `zen-clock-panel-view`.
- **Status Bar Interaktif & Rich Tooltip**: Penunjuk status bar real-time yang menampilkan jam, waktu sholat berikutnya, atau countdown Pomodoro.
- **Halaman Pengingat Sholat Khusus (Prayer Reminder Page)**: Tab editor `zenPrayerReminder` yang otomatis terbuka saat waktu sholat tiba.

### 🐛 Perbaikan Bug (Fixed)
- **Extension Host Bundling dengan esbuild**: Memperbaiki modul dependency (`adhan`) yang hilang pada file paket `.vsix` dengan mem-bundle `src/extension.ts` menggunakan `esbuild`.
- **Prayer Popover Positioning**: Memperbaiki posisi popup detail jadwal sholat agar tetap terpusat dan stabil.
