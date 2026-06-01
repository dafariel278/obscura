// ============================================================
// OBSCURA · STEP 1 — "Bisakah agent MELIHAT Mantle?"
// Jalankan: npm run ping
// ============================================================
import "dotenv/config";
import { getMantleProvider } from "./provider.js";
import { CHAINS } from "./chains.js";

async function main() {
  console.log("\n  OBSCURA :: menghubungkan ke Mantle...\n");
  const { provider, url } = await getMantleProvider(process.env);
  console.log(`  ✓ RPC aktif: ${url}`);

  const net = await provider.getNetwork();
  console.log(`  ✓ Chain ID: ${net.chainId}  (Mantle = 5000)`);

  const blockNumber = await provider.getBlockNumber();
  console.log(`  ✓ Blok terbaru: ${blockNumber}`);

  const block = await provider.getBlock(blockNumber);
  console.log(`  ✓ Blok ini berisi ${block.transactions.length} transaksi`);
  console.log(`  ✓ Waktu: ${new Date(block.timestamp * 1000).toLocaleString()}`);
  console.log(`  ✓ Explorer: ${CHAINS.mantle.explorer}/block/${blockNumber}`);

  console.log("\n  OBSCURA dapat melihat Mantle. Fondasi siap. ✦\n");
}

main().catch((e) => {
  console.error("\n  ✗ Gagal:", e.message, "\n");
  process.exit(1);
});
