// ============================================================
// OBSCURA · Deploy contract ke Mantle — npm run deploy
// ============================================================
// PRASYARAT (lihat README bagian "Langkah 5"):
//   1. Isi PRIVATE_KEY di .env (wallet TEST khusus, bukan wallet utama!)
//   2. Isi MANTLE_RPC (disarankan Mantle Sepolia testnet untuk uji coba)
//   3. Wallet harus punya sedikit MNT (dari faucet untuk testnet)
//   4. Jalankan "npm run compile" dulu.
// ============================================================
import { ethers } from "ethers";
import "dotenv/config";
import fs from "fs";

const RPC = process.env.MANTLE_RPC || "https://rpc.mantle.xyz";
const PK = process.env.PRIVATE_KEY;

async function main() {
  if (!PK) {
    console.error("\n  ✗ PRIVATE_KEY belum diisi di .env");
    console.error("    Buat wallet TEST baru, isi sedikit MNT testnet, lalu tempel private key-nya.\n");
    process.exit(1);
  }
  if (!fs.existsSync("artifacts/ObscuraLedger.json")) {
    console.error("\n  ✗ Artifact belum ada. Jalankan dulu: npm run compile\n");
    process.exit(1);
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync("artifacts/ObscuraLedger.json", "utf8"));
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(PK, provider);

  console.log("\n  OBSCURA :: men-deploy ObscuraLedger ke Mantle...");
  console.log("  Deployer:", wallet.address);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  console.log("  Menunggu konfirmasi...");
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  console.log(`\n  ✓ Contract terdeploy di: ${addr}`);
  console.log(`    Simpan alamat ini ke .env sebagai LEDGER_ADDRESS`);
  console.log(`    Inilah "contract address Mantle" untuk submit hackathon! ✦\n`);
}

main().catch((e) => console.error("\n  ✗ Deploy gagal:", e.message, "\n"));
