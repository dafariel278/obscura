// ============================================================
// OBSCURA · DOCTOR — cek apakah semuanya siap (npm run check)
// Jalankan ini kapan saja kalau ada yang terasa salah.
// ============================================================
import fs from "fs";
import "dotenv/config";

let ok = 0, warn = 0, fail = 0;
const line = (s) => console.log("  " + s);
const pass = (s) => { ok++; line("✓ " + s); };
const wn = (s) => { warn++; line("! " + s); };
const er = (s) => { fail++; line("✗ " + s); };

console.log("\n  OBSCURA :: pemeriksaan kesiapan\n");

// Node version
const major = parseInt(process.versions.node.split(".")[0], 10);
if (major >= 18) pass(`Node.js ${process.versions.node} (butuh 18+)`);
else er(`Node.js ${process.versions.node} terlalu lama — butuh 18+`);

// .env
if (fs.existsSync(".env")) pass(".env ditemukan");
else er('.env belum ada — jalankan:  cp .env.example .env');

// node_modules
if (fs.existsSync("node_modules")) pass("dependencies terpasang");
else er("node_modules belum ada — jalankan:  npm install");

// Key files
const need = [
  "src/01-ping-mantle.js", "src/02-scan-block.js", "src/03-smart-score.js",
  "src/smartmoney.js", "src/server.js", "src/ai.js", "src/chains.js",
  "contracts/ObscuraLedger.sol", "public/index.html",
];
let missing = need.filter((f) => !fs.existsSync(f));
if (missing.length === 0) pass(`${need.length} file inti lengkap`);
else er("file hilang: " + missing.join(", "));

// Optional config
const env = process.env;
if (env.MANTLE_RPC) pass("MANTLE_RPC diset"); else wn("MANTLE_RPC kosong — akan pakai RPC publik default");
if (env.ANTHROPIC_API_KEY) pass("ANTHROPIC_API_KEY diset (narasi AI aktif)"); else wn("ANTHROPIC_API_KEY kosong — narasi pakai template (server tetap jalan)");
if (env.PRIVATE_KEY) pass("PRIVATE_KEY diset (siap deploy contract)"); else wn("PRIVATE_KEY kosong — hanya perlu untuk Langkah 5 (deploy)");

console.log(`\n  Ringkasan: ${ok} OK · ${warn} peringatan · ${fail} error\n`);
if (fail > 0) {
  console.log("  ⚠ Perbaiki error di atas dulu sebelum lanjut.\n");
  process.exit(1);
} else {
  console.log("  ✦ Siap! Lanjut:  npm run ping\n");
}
