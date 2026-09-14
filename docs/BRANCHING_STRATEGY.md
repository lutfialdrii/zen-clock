# Git Branching Strategy & Isolation SOP

Dokumen ini adalah pedoman wajib bagi setiap developer dan AI Assistant yang bekerja di repositori **extension-clock**.

---

## 🛡️ Hukum Utama: Isolasi Branch (Branch Isolation)

> **"Dilarang melakukan coding fitur baru atau perbaikan langsung di branch `main`."**
> 
> Branch `main` harus selalu dalam kondisi **stabil, terverifikasi bebas error, dan siap di-package menjadi file `.vsix` kapan saja**.

Setiap pekerjaan (fitur baru, perbaikan bug, refactoring, perbaruan dokumentasi) **WAJIB** dikerjakan di branch terisolasi (*isolated branch*) atau *Git Worktree*.

---

## 🌿 Konvensi Penamaan Branch

Format penamaan branch adalah `<tipe>/<nama-spesifik-kebab-case>`:

| Tipe | Contoh Branch | Penggunaan |
| :--- | :--- | :--- |
| `feat/` | `feat/pomodoro-background-host` | Penambahan atau perombakan fitur fungsional baru |
| `feat/` | `feat/prayer-countdown-hover` | Penambahan fitur countdown di status bar / webview |
| `feat/` | `feat/kemenag-adjustment-menu` | Penambahan formula Kemenag dan menu adjust waktu sholat |
| `fix/` | `fix/webview-hibernate-timer` | Perbaikan bug atau perilaku tak terduga |
| `docs/` | `docs/extension-first-architecture` | Pembaruan dokumen panduan, arsitektur, atau spesifikasi |
| `refactor/` | `refactor/cleanup-pwa-bloat` | Pembersihan kode tanpa mengubah fungsionalitas |
| `chore/` | `chore/upgrade-vsce-packaging` | Pembaruan dependensi build atau script |

---

## 🔄 Siklus Alur Kerja Pengembangan Fitur

```mermaid
graph LR
    MAIN[main branch (stable)] -->|checkout -b feat/...| FEAT[feat/... branch]
    FEAT --> CODE[TDD / Implementation]
    CODE --> VERIFY[Quality Gate Verification]
    VERIFY --> DOCS[Update CHANGELOG & PROGRESS]
    DOCS --> MERGE[Merge to main]
    MERGE --> MAIN
```

### Langkah 1: Buat Branch Terisolasi
Pastikan `main` berada di commit terbaru, lalu buat branch fitur:
```bash
git checkout main
git pull origin main
git checkout -b feat/<nama-fitur>
```
*(Atau gunakan Git Worktree jika ingin isolasi direktori terpisah).*

### Langkah 2: Implementasi Kode
Terapkan perubahan dengan mematuhi prinsip arsitektur di [docs/ARCHITECTURE.md](file:///Users/sm/Documents/Lutfi/DEV/Learn/extension-clock/docs/ARCHITECTURE.md).

### Langkah 3: Gerbang Kualitas & Verifikasi (Quality Gate)
Sebelum mengajukan merge, jalankan seluruh verifikasi berikut:
```bash
# 1. Type check TypeScript & Bundle Extension Host
npm run compile

# 2. Build Webview React
npm run build

# 3. Uji Packaging VSIX
npm run package:vsix
```
Semua perintah di atas harus berhasil dengan **0 error dan 0 peringatan kritis**.

### Langkah 4: Dokumentasi Wajib
Sebelum merge, catat perubahan di:
- [docs/DEV_LOG.md](file:///Users/sm/Documents/Lutfi/DEV/Learn/extension-clock/docs/DEV_LOG.md) (catatan teknis & trajectory log).
- [CHANGELOG.md](file:///Users/sm/Documents/Lutfi/DEV/Learn/extension-clock/CHANGELOG.md) di root (jika ada pembaruan rilis publik).
- [docs/PROGRESS.md](file:///Users/sm/Documents/Lutfi/DEV/Learn/extension-clock/docs/PROGRESS.md) (tandai task yang telah selesai).

### Langkah 5: Merge ke `main` & Bersihkan Branch
```bash
git checkout main
git merge feat/<nama-fitur> --no-ff -m "feat(<scope>): <pesan commit>"
git branch -d feat/<nama-fitur>
```

---

## 🚫 Larangan & Anti-Pattern

1. **Anti-Ghost Commits**: Jangan pernah membuat commit fungsional tanpa mencatatnya di `docs/DEV_LOG.md`.
2. **No Broken Baseline**: Jangan pernah melakukan merge ke `main` jika build atau compile gagal.
3. **Keep Commits Atomic**: Satu commit hanya mencakup satu lingkup logis perubahan.
