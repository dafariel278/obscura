const FREE_MODELS = [
  "openai/gpt-oss-20b:free",
  "google/gemma-4-27b-it:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
];

const SYSTEM = `You are OBSCURA, a Mantle-native on-chain intelligence agent.
You monitor smart money across 8 chains: Ethereum, Base, BSC, Polygon, Arbitrum, Optimism, Solana, and Mantle.
Your specialty: detecting capital flows INTO Mantle before they happen.
Every decision is recorded on-chain via ObscuraLedger on Mantle.
Answer as a sharp, confident on-chain analyst. Max 3 sentences. No disclaimers. Terminal voice.`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { question } = req.body || {};
  if (!question) return res.status(400).json({ error: "question required" });

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const anthropicKey  = process.env.ANTHROPIC_API_KEY;

  if (!openRouterKey && !anthropicKey) {
    return res.json({ answer: "OBSCURA reasoning core offline. Add OPENROUTER_API_KEY to Vercel environment variables." });
  }

  try {
    let answer = "";

    if (openRouterKey) {
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
                { role: "system", content: SYSTEM },
                { role: "user", content: question },
              ],
              max_tokens: 250,
            }),
          });
          const d = await r.json();
          const text = d.choices?.[0]?.message?.content?.trim();
          if (text) { answer = text; break; }
        } catch { /* try next */ }
      }

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
          system: SYSTEM,
          messages: [{ role: "user", content: question }],
        }),
      });
      const d = await r.json();
      answer = d.content?.[0]?.text?.trim() || "";
    }

    res.json({ answer: answer || "Signal unclear. Try again in a moment." });
  } catch (e) {
    res.status(500).json({ answer: `Core error: ${e.message}` });
  }
}