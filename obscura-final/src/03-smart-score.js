// ============================================================
// OBSCURA · STEP 3 — Smart-Money Scoring (Lapisan 2: Otak)
// Jalankan: npm run score
// ============================================================
import "dotenv/config";
import { getMantleProvider } from "./provider.js";
import { gatherWalletActivity, rankWallets } from "./smartmoney.js";

const short = (a) => a.slice(0, 6) + "..." + a.slice(-4);

async function main() {
  console.log("\n  OBSCURA :: menghitung skor smart-money di Mantle...\n");
  const { provider, url } = await getMantleProvider(process.env);
  console.log(`  RPC: ${url}`);

  const { wallets, fromBlock, latest, totalLogs } = await gatherWalletActivity(provider, 50);
  console.log(`  Menganalisis blok ${fromBlock}–${latest} (${totalLogs} transfer, ${wallets.size} wallet unik)\n`);

  const ranked = rankWallets(wallets, 12);
  if (ranked.length === 0) { console.log("  (Belum cukup aktivitas — coba lagi sebentar.)\n"); return; }

  console.log("  ── WATCHLIST (skor tertinggi) ──\n");
  ranked.forEach((w, i) => {
    const bar = "█".repeat(Math.round(w.score / 10)).padEnd(10, "░");
    console.log(`  ${String(i + 1).padStart(2)}. ${short(w.addr)}  [${bar}] ${w.score}  · ${w.txCount} tx · ${w.tokenCount} token`);
  });

  console.log("\n  Otak OBSCURA bekerja. ✦\n");
}

main().catch((e) => { console.error("\n  ✗ Error:", e.message, "\n"); process.exit(1); });
