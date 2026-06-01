// ============================================================
// OBSCURA · STEP 2 — "Membaca transfer token nyata" (Lapisan 1: Mata)
// Jalankan: npm run scan
// ============================================================
import { ethers } from "ethers";
import "dotenv/config";
import { getMantleProvider } from "./provider.js";

const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");
const short = (a) => a.slice(0, 6) + "..." + a.slice(-4);

async function main() {
  console.log("\n  OBSCURA :: memindai transfer token di Mantle...\n");
  const { provider, url } = await getMantleProvider(process.env);
  console.log(`  RPC: ${url}`);

  const latest = await provider.getBlockNumber();
  console.log(`  Memindai blok ${latest}...\n`);

  const logs = await provider.getLogs({
    fromBlock: latest, toBlock: latest, topics: [TRANSFER_TOPIC],
  });
  console.log(`  Ditemukan ${logs.length} transfer token di 1 blok.\n`);

  for (const log of logs.slice(0, 10)) {
    if (log.topics.length < 3) continue;
    const from = "0x" + log.topics[1].slice(26);
    const to = "0x" + log.topics[2].slice(26);
    const value = BigInt(log.data === "0x" ? "0x0" : log.data);
    console.log(`  ◈ ${short(from)} → ${short(to)}  | token ${short(log.address)} | raw ${value}`);
  }
  if (logs.length === 0) console.log("  (Blok ini kebetulan tanpa transfer token — coba jalankan lagi.)");

  console.log("\n  Data mentah siap untuk Otak OBSCURA. ✦\n");
}

main().catch((e) => { console.error("\n  ✗ Error:", e.message, "\n"); process.exit(1); });
