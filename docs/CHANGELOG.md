# Changelog

Semua perubahan penting pada proyek **Zen Flip Clock & Prayer Times (VS Code Extension)** didokumentasikan di file ini secara *reverse-chronological* (terbaru di atas).

Format pencatatan mengacu pada [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) dan aturan kedisiplinan dokumentasi AI.

---

## [0.0.1] - 2026-09-14

### Bug Fixes & UX Optimization: Pomodoro Switch Warning & Widget Countdown Cleanup
- **Prompt Pengguna:**
  > *"2. BUG : saat pomodoro sedang berjalan, dan klik tombol break, langsung mereset waktu, seharusnya perlu ada peringatan terlebih dahulu"*
  > *"3. terkait count down, pada web view atau full panel ataupun sidepanel, tidak perlu menampilkan detik, cukup menit dan jam seperti rancangan awal."*
  > *"4. terkait widget bottom panel , countdown terdapat bug setiap detiknya merefresh dan mesti merender ulang widget ini, buat agar hanya menampilkan jam dan menit saja, dan susun kembali kalimat pada widgetnya supaya lebih singkat dan jelas , terutama pada kalimat '⏳ Subuh tiba dalam: 8 jam 38 menit 47 detik (08:38:47)' sejajar dengan section lokasi yang menyebabkan experiencenya kurang baik. dan pada section jam sholat , status nya cukup menampilkan '👉 Berikutnya' seperti saat rancangan awal"*
- **Komponen & File Terkait:**
  - `src/extension.ts`:
    - Menambahkan dialog konfirmasi peringatan `vscode.window.showWarningMessage` saat pengguna mengklik tombol ganti mode (Work <-> Break) ketika timer Pomodoro sedang berjalan aktif, mencegah reset sesi secara tidak sengaja.
    - Memperbaiki bug status bar refresh setiap detik: Tooltip status bar kini di-*cache* dan hanya di-*reassign* ketika konten teks markdown berubah (`lastTooltipMarkdown !== newTooltipMarkdown`), menghilangkan kedipan (*flicker*) hover tooltip.
    - Mengubah interval refresh status bar saat idle menjadi 15 detik (cukup untuk pergantian menit tanpa pemborosan komputasi).
    - Menyusun ulang tata letak tooltip status bar: Menyatukan baris lokasi dan countdown terdekat (`📍 Jakarta • ⏳ Subuh (8 jam 14 menit)`), meluruskan tabel sholat dengan alignment rata kiri pada kolom Status (`| :--- | :---: | :--- |`), dan membagi tombol menu footer menjadi 2 baris simetris seimbang agar lebar widget tidak lagi melebar melebihi tabel.
    - Menghilangkan detail detik yang berisik pada tabel jadwal sholat status bar, menyederhanakan status menjadi `👉 **Berikutnya**` sesuai rancangan awal.
  - `src/utils/prayerHelper.ts`:
    - Menambahkan helper `formatCountdownHoursMinutes(totalSeconds)` yang mengembalikan format jam dan menit bersih (`X jam Y menit`, `Y menit`, `< 1 menit`, atau `sekarang`).
  - `src/components/PrayerTime.jsx`:
    - Mengubah tampilan hitung mundur pada pil webview (panel editor, bottom panel, sidebar) agar hanya menampilkan jam dan menit tanpa detik.
    - Mengurangi interval re-render React ticker dari 1000ms menjadi 10000ms (10s), memangkas konsumsi CPU dan menghentikan efek jitter ukuran pil.
- **Hasil Verifikasi:**
  - `npm run compile`: Sukses tanpa error.
  - Unit test `formatCountdownHoursMinutes`: Sukses (menghasilkan format jam dan menit presisi).
  - `npm run package:vsix`: Sukses (`extension-clock-0.0.1.vsix` 329.63 KB).

### Milestone 4: Theme Harmonization & Customizable Accent Color System
- **Prompt Pengguna:**
  > *"menyesuaikan tema dari page webview nya, dan page reminder untuk sholat, tujuannya ya hanya menyesuaikan warna saja untuk saat ini , karena ketidakseragaman antara page pada saat zen clock dan reminder page"*
  > *"apakah memungkinkan biarkan user yang memilih accent warna? atau kita sediakan opsi opsi yang paling masuk akal?"* -> *"oke gas untuk fase awal ini"*
- **Komponen & File Terkait:**
  - `src/utils/themeHelper.ts`: Helper modular untuk mengelola preset tema terkurasi (Warm Amber `#fbbf24`, Islamic Emerald `#10b981`, Modern Sky Cyan `#38bdf8`, Pomodoro Rose `#f43f5e`, Mystic Purple `#a855f7`, Monochrome Silver `#e2e8f0`), parser kode HEX kustom dinamis, serta kalkulasi otomatis teks kontras (*luminance formula*) dan warna hover/glow.
  - `package.json`: Mendaftarkan perintah VS Code `extension-clock.changeAccentColor` dan konfigurasi `zenClock.accentColor`.
  - `src/extension.ts`:
    - Menyediakan dialog QuickPick interaktif untuk memilih preset warna tema atau memasukkan kode HEX kustom dengan validasi regex format warna.
    - Sinkronisasi reaktif: Membroadcast `THEME_COLOR_UPDATED` ke semua webview aktif saat konfigurasi `zenClock.accentColor` berubah.
    - Memperbarui halaman pengingat sholat (`ZenPrayerReminderPanel`) agar menggunakan variabel CSS tema `--zen-accent` yang sama untuk ikon bulan sabit, badge, kutipan ayat, dan tombol aksi utama.
    - Injeksi gaya awal `<style id="zen-theme-vars">` ke dalam `getWebviewContent` untuk mencegah *flicker* / kedipan warna saat webview baru dibuka.
    - Menambahkan shortcut `Warna Tema` di tooltip Status Bar.
  - `src/index.css`:
    - Mengintegrasikan variabel CSS `--zen-accent`, `--zen-accent-hover`, `--zen-accent-text`, dan `--zen-accent-glow` ke elemen navigasi aktif, highlight jadwal sholat berikutnya, hover lokasi, tombol setting, dan kontrol Pomodoro.
  - `src/App.jsx`: Menangani listener IPC `THEME_COLOR_UPDATED` dan memicu `GET_THEME_COLOR` saat inisialisasi.
  - `src/components/PrayerTime.jsx`: Menambahkan tombol `Warna Tema` di baris aksi cepat dan handler `REQUEST_CHANGE_ACCENT`.
  - `src/components/PomodoroTimer.jsx`: Memisahkan styling tombol Play (primary aksen) dan Reset (secondary).
- **Keputusan Desain & Rationale:**
  - Pendekatan *Hybrid* (Curated Presets + Custom Hex Input) memberikan kemudahan 1-klik bagi mayoritas pengguna dengan estetika dan kontras terjamin, sekaligus memberikan kebebasan kustomisasi penuh bagi power user.
  - Harmonisasi warna secara menyeluruh menghilangkan inkonsistensi visual antara Zen Clock webview dan popup Pengingat Sholat.
- **Hasil Verifikasi:**
  - `npm run compile`: Sukses tanpa error.
  - Unit test node untuk parser tema, kontras kalkulasi, dan fallback: Sukses.
  - `npm run package:vsix`: Sukses menghasilkan paket VSIX `extension-clock-0.0.1.vsix` (327.66 KB, 35 file valid).

### Milestone 2 & 3: Prayer Countdown on Hover, Auto-Refresh & Kemenag Adjustments
- **Prompt Pengguna:**
  > *"2. tambahkan countdown sholat terdekat pada saat hover di bottompanel, dan saat sholat tiba maka akan auto refresh ke sholat selanjutnya"*
  > *"3. ketidaksesuaian jam sholat , terdapat selisih waktu dengan kemenag, bagaimana mengatasinya? apakah memungkinkan untuk dibuatkan menu adjust waktu sholat?"*
- **Komponen & File Terkait:**
  - `src/utils/prayerHelper.ts`: Implementasi formula resmi Kementerian Agama RI (Fajr 20°, Isha 18°, Syafi'i, Rounding Up, +2m buffer ihtiyat). Menyediakan helper format countdown detik presisi (`formatCountdownVerbose` dan `formatCountdownDigits`).
  - `src/extension.ts`:
    - Mengintegrasikan formula Kemenag RI dengan penyesuaian kustom pengguna ke dalam `updateStatusBar`.
    - Menambahkan baris countdown real-time (`⏳ Subuh tiba dalam: 01 jam 23 menit 45 detik (01:23:45)`) di header tooltip Status Bar.
    - Menambahkan countdown dinamis di tabel jadwal sholat tooltip (`👉 Berikutnya (01:23:45)`).
    - Menambahkan menu QuickPick interaktif `extension-clock.adjustPrayerTimes` untuk menyesuaikan offset menit sholat per waktu dan tombol Reset ke standar Kemenag.
    - Menambahkan link shortcut `Sesuaikan Jam` di tooltip status bar dan penanganan pesan IPC `REQUEST_ADJUST_PRAYER` / `GET_PRAYER_ADJUSTMENTS`.
    - Auto-refresh: Saat waktu sholat tiba, host otomatis memicu notifikasi pengingat dan membroadcast `PRAYER_DATA_UPDATED` ke webviews untuk rollover instan.
  - `src/components/PrayerTime.jsx`:
    - Menggunakan parameter Kemenag RI dan sinkronisasi penyesuaian kustom dari extension host.
    - Menampilkan hitung mundur waktu sholat dalam detik presisi di pil status.
    - Menambahkan tombol interaktif `Sesuaikan Jam (Kemenag)` yang membuka QuickPick native VS Code.
  - `src/index.css`: Styling responsif untuk `.prayer-actions-bar` dan tombol `.prayer-adjust-btn`.
  - `package.json`: Mendaftarkan perintah baru `extension-clock.adjustPrayerTimes`.
- **Keputusan Desain & Rationale:**
  - Menyelaraskan jadwal sholat dengan ketetapan resmi BHR Kemenag RI di Indonesia dan memberikan fleksibilitas manual adjustment bagi pengguna yang masjid daerahnya memiliki jeda iqomah/offset lokal.
  - Memberikan pengalaman visual yang hidup dengan countdown detik yang langsung berganti (*auto-refresh*) begitu waktu sholat berikutnya tiba.
- **Hasil Verifikasi:**
  - `npm run compile`: Sukses (TypeScript 0 errors, esbuild 69.1kb, Vite build 199ms).
  - `npm run package:vsix`: Sukses (paket `extension-clock-1.0.0.vsix` 320.36 KB dengan 35 files valid).

### Milestone 1: Background Pomodoro Engine & Branding Update
- **Prompt Pengguna:**
  > *"apakah ada issue jika menggunakan opsi 3?"* -> *"oke lakukan"* (Penerapan branding "Zen Clock: Pomodoro & Muslim Prayer Times" dan migrasi Pomodoro Engine ke background Extension Host).
- **Komponen & File Terkait:**
  - `package.json`: Memperbarui `displayName` ke "Zen Clock: Pomodoro & Muslim Prayer Times", menambahkan kategori `Productivity`, keywords SEO, dan perintah `extension-clock.togglePomodoro` serta `extension-clock.resetPomodoro`.
  - `src/extension.ts`: Mengimplementasikan Background Pomodoro Engine di Extension Host (Node.js) dengan `targetEndTime` drift-proof delta, auto-tick per detik, status bar timer formatting, IPC command handler (`POMODORO_CMD`), broadcast sync (`POMODORO_SYNC`), dan notifikasi native interaktif saat sesi kerja/istirahat selesai.
  - `src/components/PomodoroTimer.jsx`: Merefaktor komponen React Pomodoro menjadi subscriber/controller murni yang tersinkronisasi langsung dengan Extension Host. Menghilangkan interval lokal yang mengalami throttling/freezing saat webview di-minimize.
  - `src/App.jsx`: Menghapus tombol install PWA dan listener `beforeinstallprompt` yang tidak diperlukan dalam lingkungan ekstensi VS Code.
  - `src/main.jsx`: Menghapus registrasi Service Worker PWA yang tidak terpakai di webview.
- **Keputusan Desain & Rationale:**
  - Mengatasi masalah utama (*root cause*) di mana timer Pomodoro terhenti saat panel VS Code ditutup atau user berpindah file. Dengan memindahkan engine ke Extension Host, timer terus berjalan di latar belakang dan semua webview (sidebar & bottom panel) selalu sinkron.
- **Hasil Verifikasi:**
  - `npm run compile`: Sukses (TypeScript 0 errors, esbuild 65.6kb, Vite build 191ms).
  - `npm run package:vsix`: Sukses (menghasilkan paket `extension-clock-1.0.0.vsix` 317.04 KB dengan 35 files valid).

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

## [0.0.0] - 2026-09-12

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
