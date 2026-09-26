
1. [DONE] menyesuaikan tema untuk page pomodoro, zenclock, dan page reminder time to pray 
2. [DONE] BUG : saat pomodoro sedang berjalan, dan klik tombol break, langsung mereset waktu, seharusnya perlu ada peringatan terlebih dahulu
3. [DONE] terkait count down, pada web view atau full panel ataupun sidepanel, tidak perlu menampilkan detik, cukup menit dan jam seperti rancangan awal.
4. [DONE] terkait widget bottom panel , countdown terdapat bug setiap detiknya merefresh dan mesti merender ulang widget ini, buat agar hanya menampilkan jam dan menit saja, dan susun kembali kalimat pada widgetnya supaya lebih singkat dan jelas , terutama pada kalimat  "⏳ Subuh tiba dalam: 8 jam 38 menit 47 detik (08:38:47)" sejajar dengan section lokasi yang menyebabkan experiencenya kurang baik. dan pada section jam sholat , status nya cukup menampilkan "👉 Berikutnya" seperti saat rancangan awal

---

### 📋 Backlog / Future Enhancements

5. [BACKLOG] **Pilihan Metode Perhitungan Waktu Sholat Internasional (Calculation Methods)**:
   - Menyediakan pilihan metode hisab astronomis di pengaturan (`zenClock.calculationMethod`):
     - **Kemenag RI** (Bawaan - Subuh 20°, Isya 18°, Syafi'i, +2m buffer ihtiyat)
     - **Muslim World League / MWL** (Eropa & Global - Subuh 18°, Isya 17°)
     - **ISNA** (Amerika Utara - Subuh 15°, Isya 15°)
     - **Umm Al-Qura** (Makkah/Saudi Arabia - Subuh 18.5°, Isya 90m setelah Maghrib)
     - **Egyptian General Authority of Survey** (Afrika Utara/Mesir - Subuh 19.5°, Isya 17.5°)
     - **Karachi / UIS** (Asia Selatan/Pakistan - Subuh 18°, Isya 18°)

6. [BACKLOG] **Opsi Madhab Waktu Ashar (Syafi'i vs Hanafi)**:
   - Menambahkan pengaturan madhab bayangan matahari waktu Ashar:
     - **Syafi'i / Maliki / Hanbali** (Bawaan - panjang bayangan 1x tinggi objek)
     - **Hanafi** (panjang bayangan 2x tinggi objek, digunakan di India, Pakistan, Turki, dll.)

7. [BACKLOG] **Penyimpanan Zona Waktu Kota Target (Remote Timezone Monitoring)**:
   - Menyimpan `timezone` IANA (contoh: `Asia/Jayapura`, `Europe/London`, `Asia/Tokyo`) saat kota dipilih atau dicari melalui OpenStreetMap Nominatim.
   - Memformat tampilan jam jadwal sholat berdasarkan zona waktu kota target menggunakan `Intl.DateTimeFormat(..., { timeZone: targetTimezone })`.
   - Manfaat: Pengguna di Jakarta (WIB) yang memilih kota Jayapura (WIT) atau London (BST/GMT) akan melihat jam lokal asli kota tersebut, bukan jam lokal komputer pengguna.
