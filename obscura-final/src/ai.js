// ============================================================
// OBSCURA · LAPISAN AI — narasi & klasifikasi (opsional tapi powerful)
// ============================================================
// Mengubah event mentah menjadi narasi tajam ala analis on-chain.
// Butuh ANTHROPIC_API_KEY di .env. Kalau tidak ada, otomatis
// fallback ke narasi template (server tetap jalan).
// ============================================================
import "dotenv/config";

const KEY = process.env.ANTHROPIC_API_KEY;

export async function narrate(event) {
  // Fallback template kalau tidak ada API key
  if (!KEY) {
    return `Wallet ${event.wallet} (skor ${event.score}) aktif pada ${event.token} — ${event.txCount} transaksi terdeteksi. Pola layak dipantau.`;
  }

  const prompt = `Kamu OBSCURA, analis on-chain di Mantle. Ubah data ini menjadi 1-2 kalimat tajam (Bahasa Indonesia), tanpa disclaimer:
Wallet: ${event.wallet}, skor smart-money: ${event.score}/100, token: ${event.token}, transaksi: ${event.txCount}.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.map((c) => c.text || "").join("") || "Sinyal terdeteksi.";
  } catch (e) {
    return `Wallet ${event.wallet} (skor ${event.score}) aktif pada ${event.token}. [AI fallback: ${e.message}]`;
  }
}
