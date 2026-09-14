# ⏰ Zen Clock: Pomodoro & Muslim Prayer Times

<p align="center">
  <img src="./assets/preview-extension-full.png" alt="Zen Clock: Pomodoro & Muslim Prayer Times" width="100%" />
</p>

<p align="center">
  <b>Aplikasi jam mekanik flip 3D retro, background Pomodoro timer tahan-tutup, dan jadwal waktu sholat otomatis berstandar resmi Kemenag RI untuk Visual Studio Code & Antigravity IDE.</b>
</p>

<p align="center">
  <a href="./README.md">English</a> | <b>Bahasa Indonesia</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/VS_Code-Extension-007acc?logo=visualstudiocode&logoColor=white" alt="VS Code Extension" />
  <img src="https://img.shields.io/badge/Antigravity_IDE-Compatible-4285F4?logo=google&logoColor=white" alt="Antigravity IDE" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## 🌟 Fitur Utama

### 🕰️ 1. Jam Mekanik Flip 3D Zen
- Tampilan jam retro-modern dengan kartu animasi lipat 3D yang halus dan menenangkan.
- Tanggal lengkap berbahasa Indonesia.
- Dapat dibuka di bilah samping (**Activity Bar Sidebar**) maupun panel bawah (**Bottom Panel**) bersanding dengan Terminal dan Output.

### 🍅 2. Engine Pomodoro Latar Belakang Sejati (Background Host)
- **Tahan Tutup & Kebal Hibernate**: Dijalankan langsung oleh proses latar belakang **Extension Host (Node.js)**. Timer tetap berhitung mundur dengan akurat meskipun panel webview ditutup, di-minimize, atau saat Anda berganti-ganti tab coding.
- **Tersinkronisasi Penuh di Seluruh Tampilan**: Sidebar, panel bawah, editor tab, dan status bar selalu membaca state timer yang sama tanpa desync.
- **Integrasi Status Bar**: Menampilkan detik hitung mundur secara live (contoh: `$(play) 24:45 [Work]`) di status bar VS Code.
- **Notifikasi OS Interaktif**: Memunculkan dialog notifikasi native saat sesi kerja/istirahat selesai, lengkap dengan tombol aksi cepat (`Mulai Istirahat` / `Mulai Kerja`).

### 🕌 3. Jadwal Sholat Otomatis Standar Kemenag RI
- Perhitungan waktu sholat presisi tinggi berbasis pustaka astronomi [`adhan`](https://github.com/batoulapps/adhan-js).
- **Parameter Resmi Kementerian Agama RI**:
  - Sudut Subuh: **20°**, Sudut Isya: **18°**
  - Madzhab: **Syafi'i**
  - Pembulatan: **Rounding Up**
  - Ihtiyat (pengaman): **+2 menit** pada seluruh waktu sholat (Terbit: -2m).
- **Menu Penyesuaian Menit (Offset)**: Pengguna dapat dengan mudah menyesuaikan selisih menit sholat jika terdapat jeda lokal/iqomah khusus di daerahnya.

### ⏳ 4. Countdown Presisi Detik di Hover & Auto-Refresh Real-Time
- **Tooltip Status Bar Real-Time**: Arahkan kursor (*hover*) ke item status bar untuk melihat countdown presisi detik (`⏳ Subuh tiba dalam: 01 jam 23 menit 45 detik (01:23:45)`).
- **Tabel Jadwal Dinamis**: Baris waktu sholat terdekat ditandai dengan label aktif dan sisa waktu hidup.
- **Auto-Refresh Tanpa Reload**: Begitu waktu sholat tiba (`00:00:00`), ekstensi otomatis memicu pengingat dan berpindah (*rollover*) ke jadwal sholat berikutnya secara mulus tanpa perlu me-reload panel.

### 📖 5. Halaman Pengingat Sholat Khusus (Prayer Reminder Page)
- Tab editor khusus (`zenPrayerReminder`) bertema gelap elegan dan menenangkan, lengkap dengan detail sholat dan kutipan ayat Al-Qur'an.
- Dapat diatur melalui setting `zenClock.autoOpenPrayerReminder`: buka otomatis tab pengingat atau cukup berupa notifikasi jendela.

### 📍 6. Pemilihan Kota Cerdas & Geolocation
- QuickPick kota populer di Indonesia serta pencarian kota di seluruh dunia via OpenStreetMap Nominatim.
- Fallback cerdas deteksi otomatis berbasis IP Geolocation jaringan.

---

## 📸 Galeri Antarmuka

| Sidebar View (Panel Samping) | Full Editor Panel Tab |
| :---: | :---: |
| <img src="./assets/preview-extension.png" alt="Zen Clock Sidebar View" width="100%" /> | <img src="./assets/preview-extension-full.png" alt="Zen Clock Full Tab View" width="100%" /> |

| Jadwal Sholat & Hover Tooltip | Pomodoro Timer |
| :---: | :---: |
| <img src="./assets/preview-hover.png" alt="Prayer Times Schedule Popover" width="100%" /> | <img src="./assets/preview-pomodoro.png" alt="Pomodoro Timer" width="100%" /> |

---

## 📦 Pemasangan Ekstensi (.vsix)

Unduh file ekstensi `.vsix` dari halaman [Releases](https://github.com/lutfialdrii/zen-clock/releases).

### Cara 1: Lewat Antarmuka IDE (Direkomendasikan)
1. Buka **VS Code** atau **Antigravity IDE**.
2. Tekan `Ctrl+Shift+X` (atau `Cmd+Shift+X` di macOS) untuk membuka panel **Extensions**.
3. Klik ikon menu titik tiga (**`...`**) di pojok kanan atas panel Extensions.
4. Pilih **Install from VSIX...**
5. Pilih file `extension-clock-0.0.1.vsix` yang telah diunduh.
6. Ikon **Zen Clock** akan langsung muncul di Activity Bar sebelah kiri Anda!

### Cara 2: Lewat Terminal / Command Line
```bash
code --install-extension extension-clock-0.0.1.vsix
```
*(Ganti `code` dengan `antigravity` jika menggunakan Antigravity IDE CLI)*

---

## ⌨️ Daftar Perintah (Command Palette)

Dapat diakses melalui Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Perintah | Judul | Deskripsi |
| :--- | :--- | :--- |
| `extension-clock.openClock` | **Zen Clock: Open Flip Clock Panel** | Membuka Zen Clock di tab editor penuh |
| `extension-clock.focusSidebar` | **Zen Clock: Focus Sidebar** | Membuka dan memfokuskan Zen Clock di sidebar samping |
| `extension-clock.focusPanel` | **Zen Clock: Focus Bottom Panel** | Menampilkan Zen Clock di panel bawah |
| `extension-clock.changeLocation` | **Zen Clock: Change City / Location** | Memilih kota populer atau cari kota dunia |
| `extension-clock.adjustPrayerTimes`| **Zen Clock: Adjust Prayer Times** | Mengatur penyesuaian koreksi menit sholat (+/-) |
| `extension-clock.togglePomodoro` | **Zen Clock: Start / Pause Pomodoro** | Menjalankan / menjeda timer Pomodoro |
| `extension-clock.resetPomodoro` | **Zen Clock: Reset Pomodoro Timer** | Mengembalikan Pomodoro ke durasi awal |
| `extension-clock.previewReminder` | **Zen Clock: Preview Prayer Reminder** | Melihat pratinjau tab pengingat sholat |
| `extension-clock.changeAccentColor` | **Zen Clock: Change Accent Color Theme** | Memilih tema warna aksen (Amber, Emerald, Azure, Rose, Custom HEX) |

---

## ⚙️ Pengaturan Ekstensi (Settings)

Akses via **Settings** (`Ctrl+,` atau `Cmd+,` $\rightarrow$ Cari `Zen Clock`):

| Pengaturan | Tipe | Default | Deskripsi |
| :--- | :---: | :---: | :--- |
| `zenClock.autoOpenPrayerReminder` | `boolean` | `true` | Otomatis membuka tab pengingat sholat khusus saat waktu sholat tiba |
| `zenClock.accentColor` | `string` | `"#fbbf24"` | Kode warna HEX atau nama preset tema Zen Clock, Pomodoro, dan Pengingat Sholat |

---

## 💻 Pengembangan & Kompilasi Lokal

### Kebutuhan Sistem
- Node.js >= 18.x
- npm >= 9.x

### Langkah Cepat
```bash
# 1. Install dependensi
npm install

# 2. Kompilasi TypeScript & Build Webview
npm run compile

# 3. Paketkan ekstensi ke file .vsix
npm run package:vsix
```

### Debugging Lokal
1. Buka repositori ini di VS Code atau Antigravity IDE.
2. Tekan `F5` (Launch Extension). Jendela Extension Development Host baru akan terbuka dengan Zen Clock aktif.

---

## 🌐 Versi Web & PWA Mandiri

Mencari versi web standalone atau Progressive Web App (PWA) dari Zen Clock?  
Versi web dikelola secara independen di repositori terpisah: [`zen-flip-clock`](https://github.com/lutfialdrii/zen-flip-clock).

---

## 📄 Lisensi

Didistribusikan di bawah lisensi MIT. Lihat file [LICENSE](./LICENSE) untuk detail.
