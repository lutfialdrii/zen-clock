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
| **M4: Pembersihan Kode PWA & Polish Tampilan** | Hapus tombol PWA install di extension, sinkronisasi tema VS Code, perapihan UI | `refactor/cleanup-pwa-bloat` | ⏳ Siap Dikerjakan |
| **M5: VSIX Release & Packaging Verifikasi** | Pengujian akhir bundle VSIX, update README & CHANGELOG final | `main` | ⏳ Antrean Akhir |

---

## 📝 Detail Tugas per Milestone

### Milestone 0: Delegasi Web & Fondasi Dokumentasi ✅
- [x] Buat branch arsip `archive/web-pwa-standalone` dan Git tag `v1.0.0-web-pwa` di repo ini.
- [x] Inisialisasi repo web mandiri di `/Users/sm/Documents/Lutfi/DEV/Learn/zen-flip-clock`.
- [x] Salin komponen terbaru (Pomodoro, Flip Clock, Prayer Times) ke repo web.
- [x] Buat `DELEGATION.md` di repo web dan pastikan build PWA berhasil (`npm run build`).
- [x] Susun `docs/ARCHITECTURE.md` (arsitektur Extension Host first).
- [x] Susun `docs/BRANCHING_STRATEGY.md` (SOP isolasi branch & quality gates).
- [x] Susun `docs/PROGRESS.md` & `docs/CHANGELOG.md`.

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

### Milestone 4: Pembersihan Kode PWA & Polish Tampilan ⏳
- [ ] Hapus tombol download/install PWA di [App.jsx](file:///Users/sm/Documents/Lutfi/DEV/Learn/extension-clock/src/App.jsx#L59-L68) (tidak relevan untuk extension VS Code).
- [ ] Hapus listener `beforeinstallprompt` dan service worker register yang tidak terpakai.
- [ ] Selaraskan warna dan font dengan tema VS Code aktif (`--vscode-editor-background`, dll.).
