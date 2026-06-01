// ============================================================
// OBSCURA · Compile smart contract — npm run compile
// Menghasilkan artifacts/ObscuraLedger.json (abi + bytecode)
// ============================================================
import solc from "solc";
import fs from "fs";
import path from "path";

const src = fs.readFileSync("contracts/ObscuraLedger.sol", "utf8");

const input = {
  language: "Solidity",
  sources: { "ObscuraLedger.sol": { content: src } },
  settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
};

console.log("\n  OBSCURA :: meng-compile ObscuraLedger.sol ...");
const out = JSON.parse(solc.compile(JSON.stringify(input)));

if (out.errors) {
  const fatal = out.errors.filter((e) => e.severity === "error");
  out.errors.forEach((e) => console.log("   " + e.formattedMessage));
  if (fatal.length) { console.error("  ✗ Compile gagal.\n"); process.exit(1); }
}

const c = out.contracts["ObscuraLedger.sol"].ObscuraLedger;
if (!fs.existsSync("artifacts")) fs.mkdirSync("artifacts");
fs.writeFileSync(
  path.join("artifacts", "ObscuraLedger.json"),
  JSON.stringify({ abi: c.abi, bytecode: "0x" + c.evm.bytecode.object }, null, 2)
);
console.log("  ✓ Tersimpan: artifacts/ObscuraLedger.json ✦\n");
