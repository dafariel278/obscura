// ============================================================
// OBSCURA · TELEGRAM BOT — src/telegram.js
// ============================================================
// Mengirim sinyal intelligence OBSCURA ke Telegram channel.
// Setup: 5 menit. Tidak perlu ubah logika apapun.
//
// CARA SETUP:
// 1. Buka Telegram, cari @BotFather
// 2. Kirim /newbot → ikuti instruksi → dapat BOT_TOKEN
// 3. Buat channel Telegram baru (mis. @ObscuraAlerts)
// 4. Tambahkan bot sebagai Admin di channel
// 5. Kirim satu pesan ke channel, lalu buka:
//    https://api.telegram.org/bot<TOKEN>/getUpdates
//    untuk dapat CHAT_ID (angka negatif, mis. -1001234567890)
// 6. Isi .env:
//    TELEGRAM_BOT_TOKEN=...
//    TELEGRAM_CHAT_ID=...
// 7. Jalankan: npm run telegram
// ============================================================

import "dotenv/config";
import { getMantleProvider } from "./provider.js";
import { gatherWalletActivity, rankWallets } from "./smartmoney.js";
import { initLedger, logDecision } from "./ledger.js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

const short = (a) => a.slice(0, 6) + "..." + a.slice(-4);

// ─────────────────────────────────────────────
// Send message to Telegram
// ─────────────────────────────────────────────
async function sendTelegram(text) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log("  [telegram] TELEGRAM_BOT_TOKEN / CHAT_ID not set — printing to console only:");
    console.log(text);
    return;
  }
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      console.log(`  [telegram] ✓ Message sent to Telegram`);
    } else {
      console.error(`  [telegram] ✗ Failed:`, data.description);
    }
  } catch (e) {
    console.error("  [telegram] Error:", e.message);
  }
}

// ─────────────────────────────────────────────
// Format signal into Telegram message
// ─────────────────────────────────────────────
function formatSignal(wallet, signalType, confidence, txHash) {
  const labels  = ["🟢 SMART MONEY", "🔴 ANOMALY", "🐋 WHALE MOVE"];
  const emojis  = ["📈", "⚠️", "🐳"];
  const label   = labels[signalType] || "📡 SIGNAL";
  const emoji   = emojis[signalType] || "📡";

  return `${emoji} <b>OBSCURA INTELLIGENCE</b>

<b>${label}</b>
━━━━━━━━━━━━━━━━━━━━
🔍 <b>Wallet:</b> <code>${wallet.addrShort}</code>
📊 <b>Score:</b> ${wallet.score}/100
🔁 <b>Transactions:</b> ${wallet.txCount}
🎯 <b>Confidence:</b> ${confidence}%
🌐 <b>Chain:</b> Mantle

📝 <b>On-chain proof:</b>
<a href="https://sepolia.mantlescan.xyz/tx/${txHash}">View on Mantle Explorer ↗</a>

━━━━━━━━━━━━━━━━━━━━
🤖 <i>Powered by OBSCURA — On-Chain Intelligence Agent</i>
🔗 <a href="https://getobscura.vercel.app">getobscura.vercel.app</a>`;
}

// ─────────────────────────────────────────────
// AI Decision via LLM
// ─────────────────────────────────────────────
async function aiDecide(wallet) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) {
    return { signalType: wallet.score > 60 ? 0 : 1, confidence: wallet.score };
  }
  const prompt = `You are OBSCURA, an on-chain AI agent. Classify this wallet:
Score: ${wallet.score}/100, Transactions: ${wallet.txCount}, Tokens: ${wallet.tokenCount}
Reply ONLY with JSON: {"signalType": 0, "confidence": 85}
(0=SmartMoney, 1=Anomaly, 2=WhaleMove)`;

  const FREE_MODELS = ["openai/gpt-oss-20b:free", "google/gemma-4-27b-it:free", "meta-llama/llama-3.2-3b-instruct:free"];
  for (const model of FREE_MODELS) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openRouterKey}`, "HTTP-Referer": "https://getobscura.vercel.app" },
        body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 60 }),
      });
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content?.trim();
      if (text) return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch { continue; }
  }
  return { signalType: wallet.score > 60 ? 0 : 1, confidence: wallet.score };
}

// ─────────────────────────────────────────────
// MAIN — Run one alert cycle
// ─────────────────────────────────────────────
async function runTelegramCycle() {
  console.log("\n  OBSCURA TELEGRAM BOT :: starting...\n");

  if (!BOT_TOKEN || !CHAT_ID) {
    console.log("  ⚠ TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID not set in .env");
    console.log("  → See setup instructions at the top of this file.");
    console.log("  → Continuing in console-only mode...\n");
  }

  const { provider } = await getMantleProvider(process.env);
  await initLedger(provider);

  // Announce bot is online
  await sendTelegram(`🤖 <b>OBSCURA AGENT ONLINE</b>

Monitoring <b>8 chains</b> for smart money signals.
Every AI decision is recorded permanently on Mantle.

🔗 <a href="https://getobscura.vercel.app">getobscura.vercel.app</a>
📍 Contract: <code>0x1E375B72Aa2d8dF87AA97DBa506C22311Efc6148</code>`);

  // Gather and analyze data
  const { wallets } = await gatherWalletActivity(provider, 200);
  const ranked = rankWallets(wallets, 3);

  if (!ranked.length) {
    await sendTelegram(`📡 <b>OBSCURA SCAN COMPLETE</b>

No high-confidence signals detected in current scan window.
Testnet activity is low — agent is monitoring continuously.

Next scan in progress... 🔄`);
    console.log("  [telegram] No signals — sent status update to Telegram.\n");
    return;
  }

  // Send alert for each top wallet
  for (const wallet of ranked) {
    const w = { ...wallet, addrShort: short(wallet.addr) };
    console.log(`  [telegram] Analyzing ${w.addrShort}...`);

    const decision = await aiDecide(w);
    const subject  = `${w.addr.slice(0, 10)} score=${w.score} tx=${w.txCount}`;

    // Log decision on-chain
    const receipt = await logDecision(
      decision.signalType,
      Math.min(Math.max(decision.confidence, 0), 100),
      subject
    );

    // Get TX hash from receipt
    const txHash = receipt?.hash || receipt?.transactionHash || "pending";

    // Send formatted alert to Telegram
    const message = formatSignal(w, decision.signalType, decision.confidence, txHash);
    await sendTelegram(message);

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("\n  OBSCURA TELEGRAM BOT :: cycle complete ✦\n");
}

runTelegramCycle().catch((e) => {
  console.error("\n  [telegram] Fatal:", e.message, "\n");
  process.exit(1);
});