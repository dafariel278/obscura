# OBSCURA — On-chain Intelligence Agent

> Agent otonom yang memantau smart money lintas-chain dan memprediksi aliran modal masuk ke **Mantle**. Setiap keputusan dicatat permanen on-chain. Identity: ERC-8004.
>
> Dibangun untuk **The Turing Test Hackathon 2026** · Track: AI Alpha & Data.

---

## ⚡ Mulai cepat (tinggal upload & jalankan)

### A. Upload ke GitHub
1. Buat repository baru di GitHub, mis. `obscura`.
2. Upload **semua file & folder** ini ke repo (drag-and-drop di web GitHub bisa).
3. Klik tombol hijau **Code → Codespaces → Create codespace on main**.
4. Tunggu ±2 menit (Codespace otomatis `npm install`).

### B. Konfigurasi (1 perintah)
Di terminal Codespace:
```bash
cp .env.example .env
```
Default `.env` sudah cukup untuk Langkah 1–4 (pakai RPC publik gratis).

### C. Jalankan bertahap
```bash
npm run ping     # Langkah 1: agent terhubung ke Mantle (Chain ID 5000)
npm run scan     # Langkah 2: baca transfer token nyata
npm run score    # Langkah 3: hitung skor smart-money wallet nyata
npm run server   # Langkah 4: jalankan backend + buka front-end OBSCURA
```
Setelah `npm run server`, buka tab **PORTS** di Codespaces → klik port **3000** → kamu akan melihat dashboard OBSCURA dengan **data Mantle nyata** (badge berubah jadi "LIVE · MANTLE DATA").

---

## 🧠 Cara kerja (4 lapisan)

1. **Mata** (`src/chains.js`, `02-scan-block.js`) — membaca transaksi dari Mantle (dan chain lain) via RPC.
2. **Otak** (`src/smartmoney.js`) — menghitung skor "kepintaran" tiap wallet dari aktivitas on-chain.
3. **Memori on-chain** (`contracts/ObscuraLedger.sol`) — mencatat keputusan agent permanen di Mantle. Inti requirement hackathon.
4. **Wajah** (`public/index.html`) — dashboard yang menampilkan semuanya; otomatis pakai data nyata dari server.

Lapisan **AI** (`src/ai.js`) mengubah event jadi narasi tajam (butuh `ANTHROPIC_API_KEY`, opsional).

---

## 🔗 Langkah 5 — Deploy smart contract ke Mantle

Ini menghasilkan **contract address** yang diminta saat submit hackathon.

```bash
# 1. Buat wallet TEST baru (JANGAN wallet utama!). Ambil private key-nya.
# 2. Untuk uji coba, pakai Mantle Sepolia TESTNET + ambil MNT gratis dari faucet.
#    Ganti MANTLE_RPC di .env ke RPC testnet, isi PRIVATE_KEY.
# 3. Compile lalu deploy:
npm run compile
npm run deploy
```
Alamat contract yang muncul → simpan sebagai `LEDGER_ADDRESS` di `.env`.

> ⚠️ **Keamanan:** `.env` sudah di-`.gitignore`. JANGAN PERNAH commit private key. Pakai wallet test berisi dana minimal.

---

## 🗺️ Peta jalan menuju Demo Day (2 Juli)

- [x] Langkah 1–4: Mantle terbaca, scoring jalan, dashboard tampil data nyata
- [x] Langkah 5: contract pencatat keputusan siap deploy
- [ ] Sambungkan `logDecision()` dari server tiap kali agent membuat sinyal
- [ ] Tambah feed harga untuk win-rate PnL nyata (lihat catatan di `smartmoney.js`)
- [ ] Aktifkan chain lain (config sudah siap di `chains.js`)
- [ ] Solana (non-EVM): butuh adapter terpisah (mis. Helius) — di luar scope EVM ini
- [ ] Mint ERC-8004 identity NFT untuk agent
- [ ] Rekam demo video + tulis pitch thread X (#MantleAIHackathon)

> **Strategi menang:** pastikan **Mantle + 1 chain** benar-benar JALAN sebelum memperluas. Juri menilai sistem yang nyata & berfungsi, bukan jumlah fitur.

---

## ❗ 3 hal yang HARUS kamu isi sendiri (tidak bisa disiapkan untukmu)
1. **RPC key pribadi** (opsional tapi disarankan) — daftar gratis di dRPC/QuickNode.
2. **ANTHROPIC_API_KEY** — untuk lapisan narasi AI (opsional).
3. **PRIVATE_KEY wallet test** — untuk deploy contract di Langkah 5.

Semua sudah ada tempatnya di `.env` — tinggal isi.
