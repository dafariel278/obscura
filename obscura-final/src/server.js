// ============================================================
// OBSCURA · SERVER — versi dengan on-chain logging (npm run server)
// File: src/server.js — GANTI yang lama dengan file ini
// ============================================================
import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";

import { CHAINS } from "./chains.js";
import { getMantleProvider } from "./provider.js";
import { gatherWalletActivity, rankWallets } from "./smartmoney.js";
import { narrate } from "./ai.js";
import { initLedger, logDecision, getAgentReputation, SignalType } from "./ledger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "..", "public")));

const PORT = process.env.PORT || 3000;
let provider = null;

async function ensureProvider() {
  if (!provider) ({ provider } = await getMantleProvider(process.env));
  return provider;
}

const short = (a) => a.slice(0, 6) + "..." + a.slice(-4);

// Cache
let cache = { watchlist: [], feed: [], reputation: null, updated: 0 };
const CACHE_MS = 20000;

async function refresh() {
  if (Date.now() - cache.updated < CACHE_MS && cache.watchlist.length) return cache;
  try {
    const prov = await ensureProvider();
    const { wallets } = await gatherWalletActivity(prov, 40);
    const ranked = rankWallets(wallets, 12);
    cache.watchlist = ranked.map((w) => ({ ...w, addrShort: short(w.addr) }));

    // Bangun feed + LOG setiap sinyal ke Mantle on-chain
    const feed = [];
    for (let i = 0; i < Math.min(5, ranked.length); i++) {
      const w = ranked[i];

      // Tentukan tipe sinyal berdasarkan skor
      let type = SignalType.SmartMoney;
      if (w.score < 30) type = SignalType.Anomaly;
      else if (w.score > 85) type = SignalType.SmartMoney;

      const conf = Math.min(w.score, 95);
      const subject = `${w.addr ? w.addr.slice(0,10) : 'wallet'} score=${w.score} tx=${w.txCount}`;
      const evText = { wallet: w.addrShort, score: w.score, token: "MNT", txCount: w.txCount };

      // Narasi AI (opsional)
      const text = i < 2 ? await narrate(evText) : `Wallet ${w.addrShort} aktif (skor ${w.score}).`;

      // ★ CATAT KE MANTLE ON-CHAIN ★
      await logDecision(type, conf, subject);

      feed.push({ type: "smart", confidence: conf, chain: "Mantle", text, wallet: w.addrShort });
    }

    // Baca reputasi terbaru dari contract
    cache.reputation = await getAgentReputation();
    cache.feed = feed;
    cache.updated = Date.now();
  } catch (e) {
    console.error("refresh error:", e.message);
  }
  return cache;
}

// Routes
app.get("/api/status", async (req, res) => {
  const rep = await getAgentReputation();
  res.json({
    agent: "OBSCURA",
    chain: "Mantle",
    chainId: CHAINS.mantle.chainId,
    online: true,
    contract: process.env.LEDGER_ADDRESS || null,
    reputation: rep,
  });
});

app.get("/api/watchlist", async (req, res) => {
  const c = await refresh();
  res.json({ watchlist: c.watchlist, updated: c.updated });
});

app.get("/api/feed", async (req, res) => {
  const c = await refresh();
  res.json({ feed: c.feed, reputation: c.reputation, updated: c.updated });
});

// Startup
(async () => {
  console.log("\n  OBSCURA :: memulai server...\n");
  const prov = await ensureProvider();

  // Inisialisasi ledger (on-chain logging)
  await initLedger(prov);

  app.listen(PORT, () => {
    console.log(`\n  OBSCURA server aktif di http://localhost:${PORT}`);
    console.log(`  API: /api/watchlist · /api/feed · /api/status`);
    console.log(`  Buka tab PORTS → port 3000 untuk dashboard. ✦\n`);
  });
})();