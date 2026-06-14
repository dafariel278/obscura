// ============================================================
// OBSCURA · OTAK — Mesin Smart-Money Scoring (Lapisan 2)
// ============================================================
// Logika inti: untuk setiap wallet, hitung skor "kepintaran"
// berdasarkan riwayat aktivitasnya. Ini matematika atas data —
// belum perlu AI. AI dipakai nanti hanya untuk narasi.
//
// CATATAN PENTING (kejujuran teknis):
// Scoring sesungguhnya butuh data harga historis untuk menghitung
// PnL nyata. Itu butuh sumber data harga (mis. CoinGecko/DEX subgraph)
// dan logika yang lebih berat. Di sini kami implementasikan kerangka
// scoring yang BENAR strukturnya dan langsung jalan, memakai sinyal
// on-chain yang bisa diukur tanpa data harga eksternal:
//   - frekuensi aktivitas (wallet aktif vs pasif)
//   - keberagaman token (early mover sering menyentuh banyak token baru)
//   - usia & konsistensi
// Saat kamu menyambungkan feed harga, tinggal tambahkan komponen winRate
// nyata ke fungsi computeScore() — strukturnya sudah disiapkan.
// ============================================================

import { ethers } from "ethers";

const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

// Kumpulkan aktivitas wallet dari rentang blok terbaru
export async function gatherWalletActivity(provider, blockSpan = 50) {
  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latest - blockSpan + 1);

  const logs = await provider.getLogs({
    fromBlock,
    toBlock: latest,
    topics: [TRANSFER_TOPIC],
  });

  // Map: wallet -> statistik aktivitas
  const wallets = new Map();
  function touch(addr) {
    if (!wallets.has(addr)) {
      wallets.set(addr, { addr, txCount: 0, tokens: new Set(), firstBlock: null, lastBlock: null });
    }
    return wallets.get(addr);
  }

  for (const log of logs) {
    if (log.topics.length < 3) continue;
    const from = ("0x" + log.topics[1].slice(26)).toLowerCase();
    const to = ("0x" + log.topics[2].slice(26)).toLowerCase();
    const token = log.address.toLowerCase();
    const bn = log.blockNumber;

    for (const a of [from, to]) {
      if (a === "0x0000000000000000000000000000000000000000") continue;
      const w = touch(a);
      w.txCount++;
      w.tokens.add(token);
      if (w.firstBlock === null || bn < w.firstBlock) w.firstBlock = bn;
      if (w.lastBlock === null || bn > w.lastBlock) w.lastBlock = bn;
    }
  }

  return { wallets, fromBlock, latest, totalLogs: logs.length };
}

// Hitung skor 0-100 untuk satu wallet
export function computeScore(w) {
  // Komponen 1: aktivitas (lebih banyak tx = lebih aktif), di-cap
  const activity = Math.min(w.txCount / 20, 1) * 40; // maks 40 poin

  // Komponen 2: keberagaman token (early mover menyentuh banyak token)
  const diversity = Math.min(w.tokens.size / 8, 1) * 35; // maks 35 poin

  // Komponen 3: rentang aktif (konsistensi lintas blok)
  const span = (w.lastBlock ?? 0) - (w.firstBlock ?? 0);
  const consistency = Math.min(span / 40, 1) * 25; // maks 25 poin

  // --- Tempat menambahkan winRate nyata saat feed harga tersedia: ---
  // const winRateComponent = (w.winRate ?? 0) * 50;

  const score = Math.round(activity + diversity + consistency);
  return Math.max(0, Math.min(100, score));
}

// Hasilkan watchlist terurut dari skor tertinggi
export function rankWallets(walletsMap, topN = 12) {
  const scored = [];
  for (const w of walletsMap.values()) {
    if (w.txCount < 1) continue; // buang noise
    scored.push({
      addr: w.addr,
      score: computeScore(w),
      txCount: w.txCount,
      tokenCount: w.tokens.size,
    });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}
