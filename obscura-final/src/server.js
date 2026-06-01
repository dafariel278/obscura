// ============================================================
// OBSCURA · SERVER — menyatukan semua lapisan (npm run server)
// ============================================================
// Menyajikan:
//   GET /              -> front-end (public/index.html)
//   GET /api/watchlist -> smart-money watchlist nyata dari Mantle
//   GET /api/feed      -> intelligence feed nyata (dengan narasi AI)
//   GET /api/status    -> status agent
// Front-end memanggil API ini untuk mengganti data simulasi
// dengan data on-chain NYATA.
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

// Cache sederhana supaya tidak hammer RPC tiap request
let cache = { watchlist: [], feed: [], updated: 0 };
const CACHE_MS = 15000;

async function refresh() {
  if (Date.now() - cache.updated < CACHE_MS && cache.watchlist.length) return cache;
  try {
    const prov = await ensureProvider();
    const { wallets } = await gatherWalletActivity(prov, 40);
    const ranked = rankWallets(wallets, 12);
    cache.watchlist = ranked.map((w) => ({ ...w, addrShort: short(w.addr) }));

    // Bangun beberapa event feed dari top wallets (+ narasi AI untuk 3 teratas)
    const feed = [];
    for (let i = 0; i < Math.min(5, ranked.length); i++) {
      const w = ranked[i];
      const ev = { wallet: short(w.addr), score: w.score, token: "Mantle token", txCount: w.txCount };
      const text = i < 3 ? await narrate(ev) : `Wallet ${ev.wallet} aktif (skor ${ev.score}).`;
      feed.push({ type: "smart", confidence: w.score, chain: "Mantle", text, wallet: ev.wallet });
    }
    cache.feed = feed;
    cache.updated = Date.now();
  } catch (e) {
    console.error("refresh error:", e.message);
  }
  return cache;
}

app.get("/api/status", (req, res) => {
  res.json({ agent: "OBSCURA", chain: "Mantle", chainId: CHAINS.mantle.chainId, online: true });
});

app.get("/api/watchlist", async (req, res) => {
  const c = await refresh();
  res.json({ watchlist: c.watchlist, updated: c.updated });
});

app.get("/api/feed", async (req, res) => {
  const c = await refresh();
  res.json({ feed: c.feed, updated: c.updated });
});

app.listen(PORT, () => {
  console.log(`\n  OBSCURA server aktif di http://localhost:${PORT}`);
  console.log(`  API: /api/watchlist · /api/feed · /api/status`);
  console.log(`  Buka URL di atas (di Codespaces: tab PORTS) untuk melihat OBSCURA. ✦\n`);
});
