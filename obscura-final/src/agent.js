// ============================================================
// OBSCURA · AI AGENT CORE — src/agent.js
// ============================================================
// THIS is the actual autonomous AI agent.
//
// The agent loop:
// 1. Gathers on-chain data from Mantle (Eyes)
// 2. Scores wallets and detects patterns (Brain)
// 3. Sends findings to LLM for REASONING and DECISION (AI)
// 4. LLM decides: is this SmartMoney / Anomaly / WhaleMove?
// 5. Agent writes that decision ON-CHAIN via logDecision() (Memory)
//
// This proves: the AI (LLM) is the decision-maker,
// and every AI decision is recorded permanently on Mantle.
// ============================================================

import "dotenv/config";
import { getMantleProvider } from "./provider.js";
import { gatherWalletActivity, rankWallets } from "./smartmoney.js";
import { initLedger, logDecision, SignalType } from "./ledger.js";

const short = (a) => a.slice(0, 6) + "..." + a.slice(-4);

// ─────────────────────────────────────────────
// STEP 3: Ask the LLM to REASON and DECIDE
// This is the "AI" part — the LLM classifies
// the signal and determines confidence level.
// ─────────────────────────────────────────────
async function aiDecide(wallet) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const anthropicKey  = process.env.ANTHROPIC_API_KEY;

  if (!openRouterKey && !anthropicKey) {
    // Fallback: rule-based decision if no LLM key
    console.log("  [agent] No LLM key — using rule-based fallback");
    return {
      signalType: wallet.score > 70 ? "SmartMoney" : wallet.score < 30 ? "Anomaly" : "WhaleMove",
      confidence: wallet.score,
      reasoning: `Rule-based: score=${wallet.score}, txCount=${wallet.txCount}`,
    };
  }

  // ★ LLM MAKES THE DECISION ★
  // We give the AI raw on-chain data and ask it to classify the signal.
  const prompt = `You are OBSCURA, an autonomous on-chain AI agent on Mantle.

Analyze this wallet's on-chain activity and make a classification decision:

WALLET DATA:
- Address: ${wallet.addr}
- Smart-money score: ${wallet.score}/100
- Transaction count (last 40 blocks): ${wallet.txCount}
- Unique tokens touched: ${wallet.tokenCount}

CLASSIFICATION OPTIONS:
0 = SmartMoney (wallet shows profitable, coordinated behavior — score > 65)
1 = Anomaly (suspicious pattern, wash trading, or manipulation — score < 30)
2 = WhaleMove (large coordinated movement, dormant wallet reactivated)

Respond ONLY with a valid JSON object, nothing else:
{
  "signalType": 0,
  "confidence": 85,
  "reasoning": "one sentence explaining your decision"
}`;

  const FREE_MODELS = [
    "openai/gpt-oss-20b:free",
    "google/gemma-4-27b-it:free",
    "meta-llama/llama-3.2-3b-instruct:free",
  ];

  try {
    if (openRouterKey) {
      for (const model of FREE_MODELS) {
        try {
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openRouterKey}`,
              "HTTP-Referer": "https://getobscura.vercel.app",
              "X-Title": "OBSCURA-Agent",
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: prompt }],
              max_tokens: 150,
            }),
          });
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content?.trim();
          if (!text) continue;

          // Parse LLM JSON response
          const clean = text.replace(/```json|```/g, "").trim();
          const decision = JSON.parse(clean);
          console.log(`  [agent] LLM (${model}) decided: ${["SmartMoney","Anomaly","WhaleMove"][decision.signalType]} conf=${decision.confidence}%`);
          console.log(`  [agent] Reasoning: "${decision.reasoning}"`);
          return decision;
        } catch { continue; }
      }
    }

    // Anthropic fallback
    if (anthropicKey) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 150,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text?.trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const decision = JSON.parse(clean);
      console.log(`  [agent] Claude decided: ${["SmartMoney","Anomaly","WhaleMove"][decision.signalType]} conf=${decision.confidence}%`);
      return decision;
    }
  } catch (e) {
    console.error("  [agent] LLM error:", e.message);
  }

  // Final fallback
  return { signalType: wallet.score > 65 ? 0 : 1, confidence: wallet.score, reasoning: "fallback" };
}

// ─────────────────────────────────────────────
// MAIN AGENT LOOP
// ─────────────────────────────────────────────
async function runAgentCycle() {
  console.log("\n  OBSCURA AGENT :: starting reasoning cycle...\n");

  const { provider } = await getMantleProvider(process.env);
  await initLedger(provider);

  // STEP 1: Gather on-chain data
  console.log("  [agent] STEP 1 — gathering on-chain data from Mantle...");
  const { wallets, fromBlock, latest, totalLogs } = await gatherWalletActivity(provider, 40);
  console.log(`  [agent] Scanned blocks ${fromBlock}–${latest} | ${totalLogs} transfers | ${wallets.size} wallets`);

  // STEP 2: Score wallets (Brain)
  console.log("\n  [agent] STEP 2 — scoring wallets...");
  const ranked = rankWallets(wallets, 5); // top 5 only for demo
  if (!ranked.length) {
    console.log("  [agent] No wallets above threshold. Waiting for next cycle.");
    return;
  }
  console.log(`  [agent] Top wallet: ${short(ranked[0].addr)} score=${ranked[0].score}`);

  // STEP 3 + 4 + 5: For each top wallet, AI reasons → decides → logs on-chain
  console.log("\n  [agent] STEP 3–5 — AI reasoning → decision → on-chain log...\n");
  for (const wallet of ranked) {
    const w = { ...wallet, addrShort: short(wallet.addr) };
    console.log(`  [agent] Analyzing ${w.addrShort} (score ${w.score})...`);

    // ★ AI MAKES THE DECISION ★
    const decision = await aiDecide(w);

    const signalNames = ["SmartMoney", "Anomaly", "WhaleMove"];
    const subject = `${w.addr.slice(0, 10)} score=${w.score} tx=${w.txCount}`;

    // ★ AGENT WRITES DECISION ON-CHAIN ★
    console.log(`  [agent] Writing to Mantle: ${signalNames[decision.signalType]} conf=${decision.confidence}%`);
    await logDecision(decision.signalType, Math.min(decision.confidence, 100), subject);

    // Small delay between transactions
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("\n  [agent] Cycle complete. All AI decisions recorded on-chain. ✦\n");
}

// Run once, or set up interval for continuous operation
runAgentCycle().catch(console.error);