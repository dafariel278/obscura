// ============================================================
// OBSCURA · SERVER LENGKAP — dengan /api/query (OpenRouter/Anthropic)
// File ini menggantikan src/server.js sepenuhnya.
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
app.use(express.json());
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

    const feed = [];
    for (let i = 0; i < Math.min(5, ranked.length); i++) {
      const w = ranked[i];
      let type = SignalType.SmartMoney;
      if (w.score < 30) type = SignalType.Anomaly;
      const conf = Math.min(w.score, 95);
      const addr = w.addr ? w.addr.slice(0, 10) : "wallet";
      const subject = `${addr} score=${w.score} tx=${w.txCount}`;
      const evText = { wallet: w.addrShort, score: w.score, token: "MNT", txCount: w.txCount };
      const text = i < 2 ? await narrate(evText) : `Wallet ${w.addrShort} active (score ${w.score}).`;
      await logDecision(type, conf, subject);
      feed.push({ type: "smart", confidence: conf, chain: "Mantle", text, wallet: w.addrShort });
    }

    cache.reputation = await getAgentReputation();
    cache.feed = feed;
    cache.updated = Date.now();
  } catch (e) {
    console.error("refresh error:", e.message);
  }
  return cache;
}

// ── ROUTES ──────────────────────────────────────────────────

app.get("/api/status", async (req, res) => {
  const rep = await getAgentReputation();
  res.json({
    agent: "OBSCURA", chain: "Mantle", chainId: CHAINS.mantle.chainId,
    online: true, contract: process.env.LEDGER_ADDRESS || null, reputation: rep,
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

// ★ REASONING CORE — query endpoint ★
app.post("/api/query", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "question required" });

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const anthropicKey  = process.env.ANTHROPIC_API_KEY;

  if (!openRouterKey && !anthropicKey) {
    return res.json({
      answer: "OBSCURA reasoning core offline. Set OPENROUTER_API_KEY in .env to activate."
    });
  }

  const systemPrompt = `You are OBSCURA, a Mantle-native on-chain intelligence agent.
You monitor smart money across 8 chains: Ethereum, Base, BSC, Polygon, Arbitrum, Optimism, Solana, and Mantle.
Your specialty: detecting capital flows INTO Mantle before they happen.
Live: 142 smart wallets tracked. Decisions logged on-chain at 0x1E375B72Aa2d8dF87AA97DBa506C22311Efc6148.
Answer as a sharp, confident on-chain analyst. Max 3 sentences. No disclaimers. Terminal voice.`;

  try {
    let answer = "";

    if (openRouterKey) {
      // Coba model gratis secara berurutan sampai ada yang berhasil
      const FREE_MODELS = [
        "google/gemma-4-27b-it:free",
        "qwen/qwen3-next-80b-a3b-instruct:free",
        "openai/gpt-oss-20b:free",
        "nvidia/nemotron-3-super-120b-a12b:free",
        "meta-llama/llama-3.2-3b-instruct:free",
      ];

      for (const model of FREE_MODELS) {
        try {
          const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openRouterKey}`,
              "HTTP-Referer": "https://getobscura.vercel.app",
              "X-Title": "OBSCURA",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question },
              ],
              max_tokens: 250,
            }),
          });
          const d = await r.json();
          console.log(`[query] model=${model} status=${r.status} choices=${d.choices?.length}`);
          const text = d.choices?.[0]?.message?.content?.trim();
          if (text) { answer = text; break; }
        } catch (modelErr) {
          console.log(`[query] model ${model} failed: ${modelErr.message}`);
        }
      }
      if (!answer) answer = "All reasoning models temporarily unavailable. Try again in a moment.";

    } else {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 250,
          system: systemPrompt,
          messages: [{ role: "user", content: question }],
        }),
      });
      const d = await r.json();
      answer = d.content?.[0]?.text?.trim() || "Signal unclear. Try again.";
    }

    res.json({ answer });
  } catch (e) {
    res.json({ answer: `Core error: ${e.message}` });
  }
});

// ── STARTUP ─────────────────────────────────────────────────
(async () => {
  console.log("\n  OBSCURA :: memulai server...\n");
  const prov = await ensureProvider();
  await initLedger(prov);

  app.listen(PORT, () => {
    console.log(`\n  OBSCURA server aktif di http://localhost:${PORT}`);
    console.log(`  API: /api/watchlist · /api/feed · /api/status · /api/query`);
    console.log(`  Buka tab PORTS → port 3000 untuk dashboard. ✦\n`);
  });
})();