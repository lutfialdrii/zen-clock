# Zen Clock Extension: Progress Tracker & Roadmap

Dokumen ini memantau milestone, status implementasi fitur, dan roadmap ekstensi **Zen Clock**.

---

## 📊 Status Ringkasan Milestone

| Milestone | Deskripsi | Target Branch | Status |
| :--- | :--- | :--- | :---: |
| **M0: Delegasi Web & Fondasi Dokumentasi** | Arsip snapshot web, init `zen-flip-clock`, dokumentasi arsitektur & SOP isolasi branch | `docs/extension-first-architecture` | ✅ Selesai |
| **M1: Background Pomodoro Engine** | Timer jalan di Extension Host (Node.js), status bar sync, IPC broadcast ke webviews | `feat/pomodoro-background-host` | ✅ Selesai |
| **M2: Countdown Sholat di Hover & Auto-Refresh** | Countdown presisi detik di tooltip status bar & webview, auto-switch saat waktu sholat tiba | `feat/prayer-countdown-kemenag` | ✅ Selesai |
| **M3: Formula Kemenag & Menu Adjust Waktu Sholat** | Standar Kemenag RI (+2m ihtiyat), menu QuickPick/Modal penyesuaian offset waktu sholat | `feat/prayer-countdown-kemenag` | ✅ Selesai |
| **M4: Harmonisasi Tema & Pembersihan Kode** | Presets aksen warna + custom hex, harmonisasi Zen Clock & Pengingat Sholat, pembersihan kode PWA | `feat/accent-color-theme` | ✅ Selesai |
| **M5: VSIX Release & Packaging Verifikasi** | Pengujian akhir bundle VSIX, update README & CHANGELOG final | `main` | ✅ Selesai (Siap Rilis) |

---

## 📝 Detail Tugas per Milestone

### Milestone 0: Delegasi Web & Fondasi Dokumentasi ✅
- [x] Buat branch arsip `archive/web-pwa-standalone` dan Git tag `v1.0.0-web-pwa` di repo ini.
- [x] Inisialisasi repo web mandiri di `/Users/sm/Documents/Lutfi/DEV/Learn/zen-flip-clock`.
- [x] Salin komponen terbaru (Pomodoro, Flip Clock, Prayer Times) ke repo web.
- [x] Buat `DELEGATION.md` di repo web dan pastikan build PWA berhasil (`npm run build`).
- [x] Susun `docs/ARCHITECTURE.md` (arsitektur Extension Host first).
- [x] Susun `docs/BRANCHING_STRATEGY.md` (SOP isolasi branch & quality gates).
- [x] Susun `docs/PROGRESS.md` & `docs/DEV_LOG.md`.

---

### Milestone 1: Background Pomodoro Engine di Extension Host ✅
- [x] Pindahkan logika interval countdown dari `PomodoroTimer.jsx` ke `src/extension.ts`.
- [x] Simpan state Pomodoro (`isRunning`, `mode`, `timeLeft`, `targetEndTime`) di background extension host.
- [x] Implementasikan listener pesan `POMODORO_CMD` (`START`, `PAUSE`, `RESET`, `SWITCH_MODE`) di extension host.
- [x] Implementasikan broadcast `POMODORO_SYNC` ke seluruh webview yang aktif (sidebar, panel, editor).
- [x] Tampilkan countdown Pomodoro secara real-time di Status Bar saat berjalan.
- [x] Trigger notifikasi native OS saat sesi kerja / istirahat selesai.
- [x] Tambahkan commands `extension-clock.togglePomodoro` dan `extension-clock.resetPomodoro` ke Command Palette.
- [x] Perbarui branding identitas menjadi "Zen Clock: Pomodoro & Muslim Prayer Times" di `package.json`.

---

### Milestone 2: Countdown Sholat di Hover & Auto-Refresh ✅
- [x] Perbarui tooltip Status Bar agar menampilkan countdown detik presisi (`⏳ Subuh tiba dalam: 01 jam 23 menit 45 detik (01:23:45)`).
- [x] Tampilkan indikator countdown aktif di tabel jadwal sholat tooltip (`👉 Berikutnya (01:23:45)`).
- [x] Tampilkan countdown detik presisi di pil waktu sholat webview (`Subuh dalam 01 jam 23 menit 45 detik`).
- [x] Implementasikan auto-refresh rollover otomatis di extension host dan webview saat waktu sholat tercapai (detik <= 0).
- [x] Broadcast event `PRAYER_DATA_UPDATED` ke webviews saat waktu sholat tiba.

---

### Milestone 3: Formula Kemenag & Menu Adjust Waktu Sholat ✅
- [x] Terapkan parameter resmi Kemenag RI di `src/utils/prayerHelper.ts` (Subuh 20°, Isya 18°, Syafi'i, +2 menit ihtiyat).
- [x] Tambahkan Command VS Code `extension-clock.adjustPrayerTimes` (QuickPick interaktif untuk mengatur offset menit tiap waktu sholat).
- [x] Tambahkan opsi Reset Semua Koreksi ke standar Kemenag RI.
- [x] Tambahkan tombol "Sesuaikan Jam (Kemenag)" di dalam Webview `PrayerTime.jsx` yang memicu QuickPick native VS Code via IPC `REQUEST_ADJUST_PRAYER`.
- [x] Simpan konfigurasi penyesuaian di `context.globalState` dan sinkronkan secara reaktif via `PRAYER_ADJUSTMENTS_UPDATED`.

---

### Milestone 4: Harmonisasi Tema & Pembersihan Kode ✅
- [x] Hapus kode PWA yang tidak relevan untuk VS Code extension (service worker & install prompt).
- [x] Implementasikan sistem tema hybrid (Preset Terkurasi: Warm Amber, Islamic Emerald, Modern Blue, Pomodoro Rose, Mystic Purple, Monochrome Silver + Custom Hex input).
- [x] Sinkronisasi variabel CSS global (`--zen-accent`, `--zen-accent-hover`, `--zen-accent-text`, `--zen-accent-glow`) secara real-time ke semua webview terbuka (sidebar, bottom panel, reminder tab).
- [x] Selaraskan tampilan warna antara Zen Clock & Pomodoro Webview dengan Tab Pengingat Sholat (`ZenPrayerReminderPanel`).
- [x] Tambahkan tombol "Warna Tema" di dalam menu webview dan shortcut di tooltip status bar.

---

### Milestone 5: VSIX Release & Packaging Verifikasi ✅
- [x] Optimasi layout tipografi flip clock & scaling kartu Pomodoro di sidebar (`feat/pomodoro-card-scaling`).
- [x] Penyesuaian garis pemisah kartu flip 1px pada sidebar (`feat/sidebar-thin-flip-divider`).
- [x] Reorganisasi dokumentasi: `docs/DEV_LOG.md` untuk trajectory log internal, `CHANGELOG.md` untuk public release notes.
- [x] Build dan validasi paket VSIX `extension-clock-0.0.1.vsix` (333.75 KB).
- [x] Verifikasi instalasi lokal melalui `code --install-extension`.
- [x] Siap rilis tag `v0.0.1` dan GitHub Release.
