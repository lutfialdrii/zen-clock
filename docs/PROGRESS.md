# Zen Clock Extension: Progress Tracker & Roadmap

Dokumen ini memantau milestone, status implementasi fitur, dan roadmap ekstensi **Zen Clock**.

---

## 📊 Status Ringkasan Milestone

| Milestone | Deskripsi | Target Branch | Status |
| :--- | :--- | :--- | :---: |
| **M0: Delegasi Web & Fondasi Dokumentasi** | Arsip snapshot web, init `zen-flip-clock`, dokumentasi arsitektur & SOP isolasi branch | `docs/extension-first-architecture` | ✅ Selesai |
| **M1: Background Pomodoro Engine** | Timer jalan di Extension Host (Node.js), status bar sync, IPC broadcast ke webviews | `feat/pomodoro-background-host` | ⏳ Siap Dikerjakan |
| **M2: Countdown Sholat di Hover & Auto-Refresh** | Countdown presisi detik di tooltip status bar & webview, auto-switch saat waktu sholat tiba | `feat/prayer-countdown-hover` | ⏳ Menunggu M1 |
| **M3: Formula Kemenag & Menu Adjust Waktu Sholat** | Standar Kemenag RI (+2m ihtiyat), menu QuickPick/Modal penyesuaian offset waktu sholat | `feat/kemenag-adjustment-menu` | ⏳ Menunggu M2 |
| **M4: Pembersihan Kode PWA & Polish Tampilan** | Hapus tombol PWA install di extension, sinkronisasi tema VS Code, perapihan UI | `refactor/cleanup-pwa-bloat` | ⏳ Menunggu M3 |
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

### Milestone 1: Background Pomodoro Engine di Extension Host ⏳
- [ ] Pindahkan logika interval countdown dari `PomodoroTimer.jsx` ke `src/extension.ts`.
- [ ] Simpan state Pomodoro (`isRunning`, `mode`, `timeLeft`, `targetEndTime`) di background extension host.
- [ ] Implementasikan listener pesan `POMODORO_CMD` (`START`, `PAUSE`, `RESET`, `SWITCH_MODE`) di extension host.
- [ ] Implementasikan broadcast `POMODORO_SYNC` ke seluruh webview yang aktif (sidebar, panel, editor).
- [ ] Tampilkan countdown Pomodoro secara real-time di Status Bar saat berjalan.
- [ ] Trigger notifikasi native OS saat sesi kerja / istirahat selesai.

---

### Milestone 2: Countdown Sholat di Hover & Auto-Refresh ⏳
- [ ] Perbarui tooltip Status Bar agar menampilkan countdown detik presisi (`⏳ Subuh dalam 01 jam 23 menit 45 detik`).
- [ ] Tambahkan logika auto-refresh / rollover otomatis di extension host dan webview saat waktu sholat tercapai (detik <= 0).
- [ ] Pastikan tidak ada polling berlebih yang membebani CPU.

---

### Milestone 3: Formula Kemenag & Menu Adjust Waktu Sholat ⏳
- [ ] Terapkan parameter standar Kemenag RI di `src/utils/prayerHelper.js` (+2 menit pengaman/ihtiyat, sudut 20°/18°).
- [ ] Buat skema konfigurasi VS Code `zenClock.prayerAdjustments` di `package.json`.
- [ ] Tambahkan Command VS Code `extension-clock.adjustPrayerTimes` (QuickPick interaktif untuk mengatur offset menit tiap sholat).
- [ ] Tambahkan modal/tombol penyesuaian di dalam Webview `PrayerTime.jsx` agar user bisa mengubahnya langsung dari panel.

---

### Milestone 4: Pembersihan Kode PWA & Polish Tampilan ⏳
- [ ] Hapus tombol download/install PWA di [App.jsx](file:///Users/sm/Documents/Lutfi/DEV/Learn/extension-clock/src/App.jsx#L59-L68) (tidak relevan untuk extension VS Code).
- [ ] Hapus listener `beforeinstallprompt` dan service worker register yang tidak terpakai.
- [ ] Selaraskan warna dan font dengan tema VS Code aktif (`--vscode-editor-background`, dll.).
