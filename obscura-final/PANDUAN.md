# 📘 PANDUAN LENGKAP OBSCURA — Langkah demi Langkah

> Ikuti urutan ini persis. Setiap langkah punya "cara cek berhasil".
> Kalau ada yang gagal, jalankan `npm run check` untuk diagnosa otomatis.

---

## ✅ BAGIAN 1 — Upload ke GitHub

### Langkah 1.1 — Buat repository
1. Buka https://github.com → login.
2. Klik tombol **+** (kanan atas) → **New repository**.
3. Repository name: ketik `obscura`
4. Pilih **Private** (atau Public, bebas).
5. **JANGAN** centang "Add a README" (kita sudah punya).
6. Klik **Create repository**.

### Langkah 1.2 — Upload file
1. Di halaman repo kosong, klik link **uploading an existing file**.
2. Buka folder `obscura-final` di komputermu.
3. Pilih **SEMUA isi di dalamnya** (folder `src`, `contracts`, `scripts`, `public`, `.devcontainer`, dan semua file seperti `package.json`, `README.md`, dll).
   - ⚠️ Upload **isi** folder, bukan folder `obscura-final` itu sendiri.
4. Drag semua ke area upload GitHub.
5. Di bawah, klik **Commit changes**.

> **Cara cek berhasil:** di halaman repo kamu sekarang terlihat folder `src`, `contracts`, `public`, dan file `package.json`.

---

## ✅ BAGIAN 2 — Buka Codespace & Setup

### Langkah 2.1 — Jalankan Codespace
1. Di halaman repo, klik tombol hijau **Code**.
2. Pilih tab **Codespaces**.
3. Klik **Create codespace on main**.
4. Tunggu 1–3 menit. Akan terbuka editor VS Code di browser.
   - Di bawah layar mungkin muncul "Running postCreateCommand: npm install" — biarkan selesai.

> **Cara cek berhasil:** muncul editor dengan daftar file OBSCURA di kiri, dan terminal di bawah.

### Langkah 2.2 — Buat file konfigurasi
Di terminal bawah, ketik perintah ini lalu Enter:
```bash
cp .env.example .env
```

### Langkah 2.3 — Pemeriksaan kesiapan otomatis
```bash
npm run check
```
Kamu akan lihat daftar centang ✓. Dua peringatan (!) soal `ANTHROPIC_API_KEY` dan `PRIVATE_KEY` itu **normal** — keduanya opsional untuk sekarang.

> **Cara cek berhasil:** baris terakhir berbunyi "✦ Siap! Lanjut: npm run ping"
> Kalau `npm install` belum jalan otomatis, ketik `npm install` lalu ulangi.

---

## ✅ BAGIAN 3 — Jalankan OBSCURA (4 langkah inti)

### Langkah 3.1 — Agent melihat Mantle
```bash
npm run ping
```
> **Berhasil bila:** muncul "Chain ID: 5000" dan nomor blok terbaru.
> Kalau RPC publik lambat, script otomatis mencoba RPC cadangan — tunggu saja.

### Langkah 3.2 — Baca transfer token nyata
```bash
npm run scan
```
> **Berhasil bila:** muncul daftar transfer "◈ 0x.... → 0x...."
> (Kalau blok kebetulan kosong, jalankan lagi.)

### Langkah 3.3 — Skor smart-money
```bash
npm run score
```
> **Berhasil bila:** muncul WATCHLIST berisi wallet dengan bar skor.

### Langkah 3.4 — Jalankan dashboard
```bash
npm run server
```
Lalu:
1. Lihat panel bawah, klik tab **PORTS**.
2. Cari baris port **3000** → arahkan mouse → klik ikon 🌐 (Open in Browser).
3. Dashboard OBSCURA terbuka di tab baru.

> **Berhasil bila:** dashboard muncul dengan animasi Matrix, dan badge kiri-atas berubah jadi **"LIVE · MANTLE DATA"** (artinya watchlist memakai data Mantle nyata).
> Untuk menghentikan server: klik terminal lalu tekan **Ctrl + C**.

---

## ✅ BAGIAN 4 — (Opsional) Aktifkan narasi AI

1. Buka https://console.anthropic.com → buat API key.
2. Di Codespace, buka file `.env` (klik di daftar file kiri).
3. Cari baris `# ANTHROPIC_API_KEY=` → hapus tanda `#` di depan → tempel key-mu:
   ```
   ANTHROPIC_API_KEY=sk-ant-....
   ```
4. Simpan (Ctrl+S). Jalankan ulang `npm run server`.

> Sekarang narasi feed dibuat oleh AI, bukan template.

---

## ✅ BAGIAN 5 — Deploy smart contract ke Mantle (menghasilkan contract address untuk submit)

> ⚠️ **PENTING soal keamanan:** buat wallet **BARU khusus test**. Jangan pakai wallet utama. Jangan pernah commit private key.

### Langkah 5.1 — Siapkan wallet & dana test
1. Pasang MetaMask (extension browser), buat **akun baru** khusus untuk ini.
2. Untuk uji coba, pakai **Mantle Sepolia Testnet** (gratis):
   - Cari "Mantle Sepolia faucet" untuk dapat MNT test gratis.
3. Salin **private key** akun test itu (MetaMask → Account details → Show private key).

### Langkah 5.2 — Isi .env
Buka `.env`, isi:
```
MANTLE_RPC=https://rpc.sepolia.mantle.xyz
PRIVATE_KEY=0x....(private key wallet test-mu)
```

### Langkah 5.3 — Compile & deploy
```bash
npm run compile
npm run deploy
```
> **Berhasil bila:** muncul "Contract terdeploy di: 0x...."
> **Salin alamat itu** — inilah "contract address Mantle" yang diminta saat submit hackathon.
> Simpan juga ke `.env` sebagai `LEDGER_ADDRESS=0x....`

---

## 🆘 Kalau ada masalah

| Gejala | Solusi |
|---|---|
| `command not found: npm` | Codespace belum siap, tunggu, atau reload halaman |
| Error koneksi RPC | Script otomatis coba RPC cadangan; atau isi `MANTLE_RPC` pribadi di `.env` |
| `Cannot find module` | Jalankan `npm install` |
| Apa pun terasa salah | Jalankan `npm run check` untuk diagnosa |
| Port 3000 tidak muncul | Tab PORTS → Add Port → ketik 3000 |

---

## 🎯 Setelah semua jalan — langkah menuju menang

1. Sambungkan `logDecision()` ke server agar tiap sinyal tercatat on-chain.
2. Tambah feed harga untuk win-rate nyata (lihat catatan di `src/smartmoney.js`).
3. Aktifkan chain lain (config siap di `src/chains.js`).
4. Mint ERC-8004 identity NFT untuk agent.
5. Rekam demo video + tulis pitch thread X dengan #MantleAIHackathon.

Selamat membangun. ✦
