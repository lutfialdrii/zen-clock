# Engineering & Development Trajectory Log

Dokumen ini adalah catatan teknis internal (*development trajectory log*) proyek **Zen Clock (VS Code Extension)** yang mencatat setiap prompt pengguna, analisis masalah, keputusan arsitektur, dan laporan verifikasi commit secara *reverse-chronological* (terbaru di atas).

Untuk ringkasan rilis publik (*public release notes*), lihat [CHANGELOG.md](../CHANGELOG.md) di root direktori.

---

## [0.0.1] - 2026-09-15

### Feature & Localization: Multi-Language Support (Indonesian Default & English Optional)
- **Prompt Pengguna:**
  > *"secara defaultnya berbahasa indonesia, namun kita sediakan jika ingin menggunakan bahasa inggris"*
- **Akar Masalah (Root Cause):**
  - Sebelumnya sebagian besar antarmuka, format tanggal, teks countdown waktu sholat, notifikasi OS, quickpick prompts, dan reminder panel di-hardcode dalam Bahasa Indonesia tanpa mekanisme internasionalisasi (i18n) dinamis.
- **Solusi & Perbaikan:**
  - Membuat modul kamus terjemahan terpusat `src/utils/i18n.ts` dengan schema `Translations` yang mencakup:
    - Nama waktu sholat (Fajr/Sunrise/Dhuhr/Asr/Maghrib/Isha vs Subuh/Terbit/Dzuhur/Ashar/Maghrib/Isya).
    - Unit countdown jam/menit/detik (`hour`, `minute`, `second`, `in`, dsb).
    - Tooltip status bar Markdown & popover jadwal sholat.
    - Notifikasi native VS Code & dialog konfirmasi aksi.
    - QuickPick prompts untuk pemilihan kota, penyesuaian offset menit, dan aksen warna tema.
    - Halaman kartu pengingat sholat (`ZenPrayerReminderPanel`) lengkap dengan terjemahan kutipan ayat Quran & tombol aksi.
  - Menambahkan konfigurasi VS Code di `package.json`: `"zenClock.language"` (enum `["id", "en"]`, default `"id"`).
  - Menambahkan command VS Code di `package.json`: `"extension-clock.changeLanguage"` ("Display: Switch Language (Ganti Bahasa)").
  - Mengimplementasikan `promptChangeLanguage` dengan QuickPick interaktif (`🇮🇩 Bahasa Indonesia (Bawaan)` / `🇬🇧 English`).
  - Menghubungkan listener `onDidChangeConfiguration` untuk `zenClock.language` agar status bar tooltip ter-refresh seketika dan mengirim event `{ type: 'LANGUAGE_UPDATED', language }` ke semua webview aktif.
  - Memperbarui Webview (`src/App.jsx`, `src/components/FlipClock.jsx`, `src/components/PrayerTime.jsx`, `src/components/PomodoroTimer.jsx`):
    - Sinkronisasi state bahasa dua arah melalui IPC (`GET_LANGUAGE` & `LANGUAGE_UPDATED`).
    - Format tanggal dinamis pada `FlipClock` (`id-ID` vs `en-US`).
    - Label tombol ("Sesuaikan Jam" / "Adjust Time", "Warna Tema" / "Theme Color"), tooltip notifikasi, dan daftar waktu sholat yang responsif terhadap bahasa aktif.
- **Hasil Verifikasi:**
  - TypeScript typecheck (`tsc -p ./ --noEmit`), esbuild bundle, dan Vite webview compilation (`npm run build`) sukses tanpa error (0 issues).
  - Peralihan bahasa antara Bahasa Indonesia dan Bahasa Inggris berjalan reaktif secara instan di Webview, Status Bar tooltip, dan notifikasi.

### Maintenance & Cleanup: Consolidating Assets Directly Under /assets
- **Prompt Pengguna:**
  > *"kalau begitu saya hapus saja directory /assets/image"*
- **Akar Masalah (Root Cause):**
  - Folder `assets/image/` redundant karena seluruh berkas screenshot manual pengguna telah disinkronkan langsung di root `assets/`.
- **Solusi & Perbaikan:**
  - Menghapus folder `assets/image/`.
  - Memperbarui seluruh referensi berkas di `README.md` dan `README.id.md` agar langsung mengarah ke `./assets/`:
    - `./assets/preview-fullview.png`
    - `./assets/preview-sidebar.png`
    - `./assets/preview-bottom-panel.png`
    - `./assets/preview-statusbar-hover.png`
    - `./assets/preview-pomodoro.png`
    - `./assets/preview-theme.png`
    - `./assets/preview-prayer-reminder.png`
- **Hasil Verifikasi:**
  - Struktur folder menjadi lebih ringkas dan rapi, tanpa duplikasi, dan seluruh gambar tampil sempurna.

### Documentation & Assets: Integrating Authentic User Manual Screenshots
- **Prompt Pengguna:**
  > *"saya telah melakukan manual screenshot pada @assets/image , bantu saya gunakan assets ini pada @README.md dan @README.id.md"*
- **Akar Masalah (Root Cause):**
  - Pengguna telah mengambil serangkaian screenshot manual otentik langsung dari lingkungan kerja VS Code / Antigravity IDE di folder `assets/image/`.
- **Solusi & Perbaikan:**
  - Memperbarui `README.md` dan `README.id.md` agar header banner dan seluruh galeri antarmuka mengarah ke gambar manual di `assets/image/`:
    - `preview-sidebar.png`
    - `preview-bottom-panel.png`
    - `preview-fullview.png`
    - `preview-statusbar-hover.png`
    - `preview-pomodoro.png`
    - `preview-theme.png`
    - `preview-prayer-reminder.png`
  - Menyinkronkan file gambar ke root folder `assets/` agar kedua path referensi tetap valid tanpa risiko broken image.
- **Hasil Verifikasi:**
  - Tampilan galeri di kedua README kini menyajikan tangkapan layar otentik dari IDE pengguna dengan sempurna.

### Assets & Visuals: High-Resolution Screenshot Regeneration
- **Prompt Pengguna:**
  > *"saya minta anda generate ulang screenshot nya, karena preview pada @assets merupakan gambar lama sebelum kita lakukan enhance"*
- **Akar Masalah (Root Cause):**
  - Gambar tangkapan layar lama pada folder `assets/` masih menggunakan desain lawas (warna biru tua standar `#007acc`, divider tebal 2px di sidebar, dan kartu Pomodoro kecil).
- **Solusi & Perbaikan:**
  - Men-generate ulang ke-7 berkas gambar tangkapan layar di folder `assets/` menggunakan rendering headless Google Chrome engine beresolusi Retina (2x DPI):
    1. `preview-extension-full.png`: Tab editor penuh dengan tema Warm Amber `#fbbf24`, jam flip 3 kartu proporsional, dan countdown waktu sholat.
    2. `preview-sidebar.png`: Sidebar Zen Clock dengan garis pemisah tipis 1px, tipografi proporsional dengan padding nyaman, dan ikon aktif di activity bar.
    3. `preview-bottom-panel.png`: Panel bawah sejajar Terminal & Output dengan garis pemisah 2px kokoh.
    4. `preview-pomodoro.png`: Pomodoro 2-Card flip clock gagah dengan tombol play/reset sirkular bercahaya pendar Warm Amber.
    5. `preview-statusbar-hover.png`: Item status bar aktif dan rich popover jadwal sholat Kemenag RI dengan countdown detik presisi.
    6. `preview-theme.png`: QuickPick menu pemilih 6 preset tema warna + custom HEX.
    7. `preview-prayer-reminder.png`: Tab pengingat sholat menenangkan dengan bulan sabit, kutipan ayat, dan tombol aksi sholat.
- **Hasil Verifikasi:**
  - Seluruh berkas gambar berhasil di-generate secara otomatis, beresolusi tajam, jernih, dan 100% mencerminkan fitur-fitur mutakhir aplikasi.

### Documentation & Showcase: Comprehensive Multi-View Interface Gallery
- **Prompt Pengguna:**
  > *"/superpowers:brainstorming terkait readme, bisakah anda membantu saya sesuaikan preview dari app nya? mulai dari bentukan sidepanel, full view, bottom panel, lalu bottom bar dan widget hover, terus mengatur tema dan semacamnya"*
- **Akar Masalah (Root Cause):**
  - Galeri pratinjau di `README.md` dan `README.id.md` sebelumnya hanya menampilkan tabel 2x2 sederhana yang belum mencakup fitur-fitur baru (seperti Bottom Panel, status bar & hover tooltip terperinci, kustomisasi warna tema, dan tab pengingat sholat).
- **Solusi & Perbaikan:**
  - Menata ulang Galeri Antarmuka (*Interface Gallery*) menjadi 4 seksi tematik:
    1. **Flexible Viewport Layouts**: Membandingkan secara proporsional Primary Sidebar View, Bottom Panel (sejajar Terminal), dan Full Editor Tab.
    2. **Status Bar & Precision Countdown**: Menampilkan widget status bar dan popover hover tooltip jadwal sholat lengkap.
    3. **Pomodoro Timer & Visual Customization**: Menampilkan timer Pomodoro 2 kartu dan menu kustomisasi warna tema.
    4. **Peaceful Prayer Reminder**: Menampilkan tab pengingat sholat otomatis yang menenangkan.
  - Memperbarui `README.md` dan `README.id.md` dengan nama berkas standar di folder `assets/` (`preview-sidebar.png`, `preview-bottom-panel.png`, `preview-extension-full.png`, `preview-statusbar-hover.png`, `preview-pomodoro.png`, `preview-theme.png`, `preview-prayer-reminder.png`).
- **Hasil Verifikasi:**
  - `npm run compile`: Sukses tanpa error.
  - `npm run package:vsix`: Sukses (`extension-clock-0.0.1.vsix` 334.98 KB).
  - Tampilan README rapi dan siap menerima pembaruan tangkapan layar langsung dari pengguna.

### DX/UX Enhancements: Command Palette Title & Grouping Refinement
- **Prompt Pengguna:**
  > *"ada sedikit hal yang cukup membingungkan pada command panel, karena banyak nya command untuk menampilkan , apakah ada command yang bisa kita kurangi, atau sedikit diberi deskripsi mengenai command yang ada? agar tidak menimbulkan ambiguitas?"*
- **Akar Masalah (Root Cause):**
  - Command pembuka jam sebelumnya menggunakan kata ambigu "Open Flip Clock Panel" padahal membuka di Tab Editor (Full View), bertabrakan secara istilah dengan "Focus Bottom Panel".
  - Inkonsistensi kata kerja (`Open...` vs `Focus...`).
  - Command fitur lainnya (`Pomodoro`, `Prayer Times`, `Theme`) belum memiliki prefix grup yang seragam di Command Palette.
- **Solusi & Perbaikan:**
  - `package.json`:
    - Menyeragamkan kata kerja pembuka menjadi `Open in Editor Tab`, `Open in Sidebar`, dan `Open in Bottom Panel`.
    - Menambahkan prefix kelompok fungsional yang teratur: `Pomodoro:`, `Prayer Times:`, dan `Theme:`.
  - `README.md` & `README.id.md`:
    - Menyelaraskan tabel dokumentasi perintah dengan penamaan baru.
- **Hasil Verifikasi:**
  - `npm run compile`: Sukses tanpa error.
  - `npm run package:vsix`: Sukses (`extension-clock-0.0.1.vsix` 334.6 KB).
  - `code --install-extension extension-clock-0.0.1.vsix --force`: Berhasil terpasang, daftar command di Command Palette kini rapi, intuitif, dan tidak ambigu.

### UI/UX Enhancements: Sidebar Viewport Flip Card Divider Refinement
- **Prompt Pengguna:**
  > *"batas garis flip pada tampilan side panel cukup tebal, buat sedikit tipis namun jika tampilan full view atau bottom panel, tebal garis sudah sangat baik"*
- **Akar Masalah (Root Cause):**
  - Garis pemisah horizontal pada kartu flip (`border-bottom: 2px solid var(--divider-color)`) di `.flip-card-top` tampak ideal pada editor view dan bottom panel yang memiliki kartu berukuran besar (180px–280px).
  - Namun pada viewport sempit seperti Primary Sidebar (kartu berukuran 92px–118px), garis tebal 2px memakan ~7% dari tinggi separuh kartu sehingga terlihat terlalu tebal (*clunky*).
- **Solusi & Perbaikan:**
  - `src/extension.ts`:
    - Menambahkan identifikasi tipe view (`viewType: 'sidebar' | 'panel' | 'editor'`) pada instansiasi `ZenClockViewProvider` dan `ZenClockPanel`.
    - Menginjeksi atribut `data-view="${viewType}"` pada tag `<body>` webview HTML.
  - `src/index.css`:
    - Menambahkan styling selektif:
      ```css
      body[data-view="sidebar"] .flip-card-top {
        border-bottom: 1px solid var(--divider-color);
      }
      @media (max-width: 480px) {
        body:not([data-view="panel"]):not([data-view="editor"]) .flip-card-top {
          border-bottom: 1px solid var(--divider-color);
        }
      }
      ```
    - Dengan ini, garis pemisah di sidebar menjadi 1px yang ramping dan presisi, sementara di editor view dan bottom panel tetap mempertahankan ketebalan tegas 2px.
- **Hasil Verifikasi:**
  - `npm run compile`: Sukses tanpa error.
  - `npm run package:vsix`: Sukses (`extension-clock-0.0.1.vsix` 333.75 KB).
  - `code --install-extension extension-clock-0.0.1.vsix --force`: Berhasil terpasang.

## [0.0.1] - 2026-09-14

### UI/UX Enhancements: Pomodoro 2-Card Flip Clock Proportional Scaling
- **Prompt Pengguna:**
  > *"terkait desain flip clock pada pomodo perlu di adjust , karena shape nya hanya dua jadi pastikan buat proporsional , sepertinya perlu ditambahkan besar shape nya"*
- **Akar Masalah (Root Cause):**
  - Timer Pomodoro hanya menampilkan 2 kartu (`Menit` dan `Detik`), berbeda dengan jam utama yang menampilkan 3 kartu (`Jam`, `Menit`, `Detik`).
  - Sebelumnya Pomodoro menggunakan ukuran kartu jam 3-unit (`width: 64px – 170px`), sehingga tampilan Pomodoro tampak terlalu kecil dan meninggalkan banyak ruang kosong yang tidak seimbang di kedua sisinya.
- **Solusi & Perbaikan:**
  - `src/index.css`:
    - Menambahkan styling khusus untuk `.pomodoro-flip-clock`:
      - `width: clamp(85px, 24vw, 210px)` (~33% lebih lebar & proporsional untuk 2 kartu).
      - `height: clamp(118px, 32vw, 280px)` (aspek rasio kartu lebih gagah).
      - `font-size: clamp(52px, 14vw, 135px)` (mematuhi rasio ideal ~60% dari lebar kartu, angka bebas dari risiko mentok ke border).
      - `gap: clamp(10px, 2.5vw, 28px)`.
    - Membuat padding `.pomodoro-container` responsif: `padding: clamp(16px, 3vw, 24px) clamp(12px, 3vw, 28px)` agar pas di sidebar sempit (240px–260px) tanpa scrollbar horizontal.
- **Hasil Verifikasi:**
  - `npm run compile`: Sukses tanpa error.
  - `npm run package:vsix`: Sukses (`extension-clock-0.0.1.vsix` 333.01 KB).
  - `code --install-extension extension-clock-0.0.1.vsix --force`: Berhasil terpasang.
  - Kartu Pomodoro kini tampak gagah, fokus, dan seimbang baik di sidebar maupun editor tab.

### Documentation Restructuring: Separating Public Release Notes and Internal Dev Log
- **Prompt Pengguna:**
  > *"mengapa kita menulis 2 CHANGELOG ?"*
  > *"sepertinya CHANGELOG pada directory docs perlu direname, karena changelog pada root directory sebagai release note"*
- **Akar Masalah (Root Cause):**
  - Proyek sebelumnya memiliki dua file dengan nama identik (`./CHANGELOG.md` di root dan `docs/CHANGELOG.md` di folder docs), yang menyebabkan redundansi, documentation drift, dan kebingungan acuan.
- **Solusi & Perbaikan:**
  - Melakukan `git mv docs/CHANGELOG.md docs/DEV_LOG.md` untuk mengkhususkan dokumen di folder `docs/` sebagai **Internal Engineering & Development Trajectory Log**.
  - Mengubah `./CHANGELOG.md` di root direktori menjadi **Official Release Notes** (`[0.0.1] - 2026-09-14`) untuk pengguna publik dan VS Code Marketplace dalam format dwibahasa (English & Bahasa Indonesia).
  - Memperbarui seluruh referensi dokumen di `docs/BRANCHING_STRATEGY.md` dan `docs/PROGRESS.md` agar mengarah ke `docs/DEV_LOG.md`.
- **Hasil Verifikasi:**
  - `npm run compile`: Sukses tanpa error.
  - `npm run package:vsix`: Sukses (`extension-clock-0.0.1.vsix` 332.61 KB, rapi memuat changelog.md publik dan docs/DEV_LOG.md internal).
  - `code --install-extension extension-clock-0.0.1.vsix --force`: Berhasil terpasang.

### UI/UX Enhancements: Flip Clock Typography Scaling & Shape Padding in Sidepanel
- **Prompt Pengguna:**
  > *"terkait text pada flip clock pada webview sidepanel, sepertinya tampilannya agak terlalu sempit alias mentok di shape nya, bagaimana mengatasinya?"*
- **Akar Masalah (Root Cause):**
  - Pada `src/index.css`, batas bawah ukuran font ditetapkan terlalu besar (`font-size: clamp(60px, 16vw, 140px)`), sementara batas bawah lebar kartu adalah `width: clamp(70px, 20vw, 180px)`.
  - Pada font tebal 60px, dua digit angka memakan lebar ~65-72px, sehingga di sidepanel sempit teks memakan hampir 100% lebar kartu dan menabrak lengkungan border shape tanpa margin kiri-kanan.
- **Solusi & Perbaikan:**
  - `src/index.css`:
    - Mengatur ulang rasio proporsional kartu jam: `width: clamp(64px, 18vw, 170px)` dan `height: clamp(92px, 25vw, 230px)`.
    - Mengurangi batas bawah ukuran font menjadi `font-size: clamp(38px, 11vw, 115px)` (~60% dari lebar kartu), menyisakan ruang bernapas (*breathing room*) nyaman ~10–12px di sisi kiri dan kanan shape.
    - Menambahkan `line-height: 1`, `letter-spacing: -0.02em`, dan `font-variant-numeric: tabular-nums` untuk perataan angka monospaced yang presisi di tengah kartu.
    - Menyesuaikan gap antar kartu `gap: clamp(6px, 1.5vw, 20px)` dan memusatkan teks tanggal `.date-display`.
- **Hasil Verifikasi:**
  - `npm run compile`: Sukses tanpa error.
  - `npm run package:vsix`: Sukses (`extension-clock-0.0.1.vsix` 332.78 KB).
  - `code --install-extension extension-clock-0.0.1.vsix --force`: Berhasil terpasang.
  - Teks jam tidak lagi menabrak tepi kartu pada sidebar sempit (240px) maupun layar penuh.

### UI/UX Enhancements: Tooltip Layout Optimization & Direct Sidebar Focus
- **Prompt Pengguna:**
  > *"terkait yang ini • ⏳ Subuh (7 jam 55 menit) lebih baik ditampilkan dipaling bawah, dan untuk countdown nya tampilannya dibuat highlight seperti `7 Jam 55 menit`, seperti sebelumnya"*
  > *"terus tulisan Kemanag RI tidak perlu ditampilkan, nantinya cukup kita disclaimer atau deskripsi pada marketplace atau readme.md"*
  > *"dan terkait table Waktu Jam Status, jaraknya agak terlalu dekat antar kolom"*
  > *"terkait settings menu , sepertinya untuk 'Buka Panel' kita hapus saja , dan saat bottom panel di klik , cukup buka sidepanel saja , bukan buka panel yang sejajar dengan terminal, bantu ubah ini"*
- **Komponen & File Terkait:**
  - `src/extension.ts`:
    - Memindahkan hitung mundur waktu sholat ke bawah tabel sholat dengan format highlight inline code: `⏳ **Subuh** tiba dalam \`7 jam 55 menit\``.
    - Menghilangkan teks `(Kemenag RI)` dari header: `### 🕌 **Jadwal Sholat**`.
    - Menambahkan padding non-breaking space `&nbsp;&nbsp;` antar kolom tabel (`Waktu`, `Jam`, `Status`) agar kolom tidak berhimpitan dan lega dipandang.
    - Membersihkan teks `(Default)` dari fallback nama lokasi (`'Jakarta'` dan sanitasi `.replace(/\s*\(Default\)/i, '')`).
    - Mengalihkan aksi klik item Status Bar dari membuka panel bawah ke memfokuskan Sidebar Zen Clock (`zen-clock-sidebar.focus`).
    - Menghilangkan tombol `Buka Panel` dari footer tooltip, menyatukan 3 aksi penting dalam satu baris simetris: `[Ganti Kota] • [Sesuaikan Jam] • [Warna Tema]`.
    - Mendaftarkan command baru `extension-clock.focusSidebar` ("Focus Sidebar (Buka Sidebar)").
  - `src/components/PrayerTime.jsx`:
    - Mengubah fallback lokasi bawaan dari `'Jakarta (Default)'` menjadi `'Jakarta'`.
  - `package.json`, `README.md`, `README.id.md`:
    - Mendaftarkan perintah `extension-clock.focusSidebar` di manifest dan tabel dokumentasi.
- **Hasil Verifikasi:**
  - `npm run compile`: Sukses tanpa error (0 error).
  - `npm run package:vsix`: Sukses (`extension-clock-0.0.1.vsix` 332.07 KB).
  - `code --install-extension extension-clock-0.0.1.vsix --force`: Berhasil terpasang.

### Bug Fixes: VSIX Publisher Conflict Resolution & Clean Command Titles
- **Prompt Pengguna:**
  > *"mengapa saat saya install .vsix file pada vscode seperti nya ada beberapa bug dan extension tidak berjalan sesuai yang diharapkan, diantaranya Command 'Zen Clock: Zen Clock: Change Accent Color Theme (Ubah Warna Tema)' resulted in an error"*
- **Akar Masalah (Root Cause):**
  1. **Konflik Publisher Lama (`developer.extension-clock@1.0.0` vs `lutfialdrii.extension-clock@0.0.1`)**:
     - Sebelumnya extension terinstall dengan publisher lama `developer` versi `1.0.0` di `~/.vscode/extensions/developer.extension-clock-1.0.0`.
     - Ketika file `.vsix` baru dengan publisher `lutfialdrii` diinstall, VS Code menganggapnya sebagai dua ekstensi yang berbeda dan tidak otomatis menghapus versi lama.
     - Saat VS Code memuat ekstensi, `developer.extension-clock` aktif lebih dulu dan mendaftarkan perintah `extension-clock.openClock`. Saat `lutfialdrii.extension-clock` berusaha aktif, VS Code melempar error fatal `command 'extension-clock.openClock' already exists` pada baris aktivasi pertama.
     - Akibatnya, aktivasi `lutfialdrii.extension-clock` terhenti (*crashed*) sehingga perintah baru seperti `extension-clock.changeAccentColor` tidak pernah terdaftar.
  2. **Duplikasi Kategori & Judul Perintah di `package.json`**:
     - Di `package.json`, perintah didefinisikan dengan `"category": "Zen Clock"` DAN `"title": "Zen Clock: ..."` sehingga VS Code merender judul ganda di Command Palette: `Zen Clock: Zen Clock: Change Accent Color Theme...`.
- **Solusi & Perbaikan:**
  - Menjalankan `code --uninstall-extension developer.extension-clock` untuk membersihkan artefak ekstensi versi lama yang berkonflik.
  - Memperbarui `package.json`: Menghapus prefix redundan `"Zen Clock: "` dari seluruh properti `title` di `contributes.commands` sehingga tampil rapi dan standar (`Zen Clock: Change Accent Color Theme (Ubah Warna Tema)`).
  - Memperbarui `src/extension.ts`: Membungkus logika `promptChangeAccentColor` dalam blok `try ... catch` untuk menangani kegagalan konfigurasi secara anggun dengan pesan error informatif.
  - Memperbarui `README.md` dan `README.id.md`: Mendaftarkan perintah `extension-clock.changeAccentColor` dan konfigurasi `zenClock.accentColor` pada tabel dokumentasi.
  - Mengompilasi ulang dan memaketkan VSIX via `npm run package:vsix` serta menginstall ulang dengan `code --install-extension extension-clock-0.0.1.vsix --force`.
- **Hasil Verifikasi:**
  - Hanya satu ekstensi yang terpasang: `lutfialdrii.extension-clock@0.0.1`.
  - Log aktivasi bebas dari error `command already exists`.
  - Judul perintah di Command Palette bersih tanpa duplikasi prefix.

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
