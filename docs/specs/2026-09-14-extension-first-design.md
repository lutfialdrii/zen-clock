# Spesifikasi Teknis: Migrasi Extension-First & Perbaikan Fitur Inti

Dokumen spesifikasi desain teknis untuk pengerjaan fitur-fitur inti pada ekstensi VS Code Zen Clock.

---

## 🎯 Tujuan & Lingkup

1. **Memigrasikan Pomodoro Timer ke Extension Host (Background State)**:
   - Mengatasi bug state ganda atau timer mati/freeze saat webview di-minimize atau panel ditutup.
   - Extension Host (`src/extension.ts`) bertindak sebagai single source of truth timer.
   - Seluruh tampilan webview (sidebar, panel bawah, editor tab) dan Status Bar selalu sinkron.

2. **Countdown Waktu Sholat Terdekat di Status Bar Hover & Auto-Refresh**:
   - Tooltip Status Bar menampilkan hitung mundur presisi per detik (`⏳ Subuh dalam 01 jam 23 menit 45 detik`).
   - Begitu waktu sholat tiba (00:00:00), sistem otomatis berpindah (*auto-switch*) ke jadwal sholat berikutnya secara mulus.

3. **Formula Kemenag RI & Menu Penyesuaian Waktu Sholat**:
   - Menggunakan parameter resmi Kementerian Agama RI (Subuh 20°, Isya 18°, Madzhab Syafi'i, Ihtiyat +2 menit).
   - Menyediakan menu interaktif untuk melakukan penyesuaian (offset) waktu sholat secara manual jika diperlukan oleh pengguna lokal.

---

## 🏗️ Desain Rinci Fitur

### 1. Background Pomodoro Engine (di `src/extension.ts`)

#### State Model:
```typescript
interface PomodoroEngineState {
  isRunning: boolean;
  mode: 'work' | 'break';
  timeLeft: number;        // sisa detik
  totalDuration: number;   // total detik sesi saat ini (misal: 1500s atau 300s)
  targetEndTime?: number;  // timestamp milidetik kapan timer berakhir
}
```

#### Alur Eksekusi:
1. Saat user menekan tombol Play di webview mana pun:
   - Webview mengirim pesan IPC: `{ type: 'POMODORO_CMD', action: 'start' }`.
2. Extension Host:
   - Mengubah `isRunning = true`.
   - Menetapkan `targetEndTime = Date.now() + timeLeft * 1000`.
   - Menjalankan interval 1 detik di Node.js (Extension Host tidak terpengaruh oleh rendering VS Code).
   - Di setiap detik:
     - Menghitung `timeLeft = Math.max(0, Math.round((targetEndTime - Date.now()) / 1000))`.
     - Memperbarui teks dan icon di Status Bar VS Code.
     - Mengirim `postMessage({ type: 'POMODORO_SYNC', state })` ke semua `activeWebviews`.
3. Saat `timeLeft === 0`:
   - Host memicu notifikasi native VS Code:
     `vscode.window.showInformationMessage('🍅 Sesi Pomodoro selesai! Waktunya istirahat.')`.
   - Host otomatis mengubah mode ke `break` (atau sebaliknya) dan menyinkronkan state baru.

---

### 2. Countdown Sholat di Hover Tooltip & Auto-Refresh

#### Kalkulasi & Tampilan Tooltip:
```markdown
### 🕌 Jadwal Waktu Sholat (Kemenag RI)
📍 **Lokasi**: Jakarta, DKI Jakarta
⏳ **Subuh tiba dalam**: `01 jam 24 menit 12 detik`

| Waktu | Jam | Status |
| :--- | :---: | :---: |
| **Subuh** | **04:36** | 👉 **Berikutnya (01:24:12)** |
| Terbit | 05:48 | — |
| Dzuhur | 11:56 | — |
| Ashar | 15:10 | — |
| Maghrib | 17:58 | — |
| Isya | 19:07 | — |
```

#### Mekanisme Auto-Refresh:
- Timer `statusBarTimer` berdetik per 1 detik di Host.
- Jika selisih waktu `diffMs = nextPrayerDate.getTime() - now.getTime() <= 0`:
  - Host memicu panggilan `triggerPrayerReminder()` jika belum dipicu untuk sholat tersebut.
  - Host mengkalkulasi ulang `nextPrayer` hari ini atau besok.
  - Host mengirim pesan `{ type: 'PRAYER_DATA_UPDATED' }` ke webview agar UI ikut berpindah secara real-time tanpa perlu refresh manual.

---

### 3. Formula Kemenag RI & Menu Penyesuaian

#### File Utility (`src/utils/prayerHelper.js`):
```javascript
export function getKemenagCalculationParameters(customAdjustments = {}) {
  const params = new CalculationParameters('Other', 20, 18);
  params.madhab = Madhab.Shafi;
  params.rounding = Rounding.Up;

  const defaultIhtiyat = {
    fajr: 2,
    sunrise: -2,
    dhuhr: 2,
    asr: 2,
    maghrib: 2,
    isha: 2
  };

  params.adjustments = {
    ...defaultIhtiyat,
    ...customAdjustments
  };

  return params;
}
```

#### Menu Penyesuaian (Command & Webview UI):
1. **VS Code Command**: `extension-clock.adjustPrayerTimes`
   - Membuka menu `vscode.window.showQuickPick` yang mencantumkan setiap waktu sholat beserta offset saat ini.
   - Contoh: `Subuh (+2 menit Kemenag) [Klik untuk ubah]`.
   - User memasukkan angka (misal `-1`, `0`, `+1`, `+3`).
   - Disimpan di `context.globalState` atau `zenClock.prayerAdjustments` VS Code settings.
2. **Webview UI Integration**:
   - Tombol gear/slider di sebelah lokasi jadwal sholat untuk membuka modal penyesuaian langsung di layar panel.

---

## 🧪 Rencana Pengujian & Verifikasi

1. **Uji Isolasi Pomodoro**:
   - Buka sidebar webview, klik Start.
   - Buka tab Terminal atau tutup sidebar. Perhatikan status bar tetap berhitung mundur dengan mulus.
   - Buka bottom panel: waktu di bottom panel harus langsung sinkron dengan sisa waktu di status bar.
2. **Uji Auto-Refresh Sholat**:
   - Jalankan uji unit simulasi waktu saat waktu sholat tercapai: tooltip harus langsung berpindah ke sholat berikutnya.
3. **Uji Bundle & Packaging**:
   - Jalankan `npm run compile && npm run build && npm run package:vsix`.
   - Pastikan file `.vsix` terbuat tanpa warning dependensi hilang.
