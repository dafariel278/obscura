// ============================================================
// OBSCURA · LEDGER CONNECTOR — mencatat keputusan on-chain
// File: src/ledger.js
//
// Setiap kali OBSCURA menghasilkan sinyal (smart money,
// anomaly, whale), fungsi logDecision() dipanggil dan
// keputusan itu ditulis PERMANEN ke contract di Mantle.
//
// CARA PAKAI: tambahkan LEDGER_ADDRESS ke .env setelah deploy.
// Kalau LEDGER_ADDRESS kosong, log tetap jalan tapi hanya
// ke console (agent tidak berhenti).
// ============================================================

import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ABI hanya fungsi yang kita butuhkan (tidak perlu ABI penuh)
const LEDGER_ABI = [
  "function logDecision(uint8 signalType, uint8 confidence, string subject) returns (uint256)",
  "function decisionCount() view returns (uint256)",
  "function accuracyBps() view returns (uint256)",
  "event DecisionLogged(uint256 indexed id, uint8 signalType, uint8 confidence, string subject)",
];

// SignalType enum (harus cocok dengan contract Solidity)
export const SignalType = {
  SmartMoney: 0,
  Anomaly: 1,
  WhaleMove: 2,
};

let contract = null;
let wallet = null;
let enabled = false;

export async function initLedger(provider) {
  const address = process.env.LEDGER_ADDRESS;
  const pk = process.env.PRIVATE_KEY;

  if (!address || !pk) {
    console.log("  [ledger] LEDGER_ADDRESS atau PRIVATE_KEY tidak diset — logging on-chain dinonaktifkan.");
    console.log("  [ledger] Sinyal tetap jalan, hanya tidak dicatat ke contract.");
    return false;
  }

  try {
    wallet = new ethers.Wallet(pk, provider);
    contract = new ethers.Contract(address, LEDGER_ABI, wallet);

    // Uji koneksi: baca jumlah keputusan yang sudah ada
    const count = await contract.decisionCount();
    const acc = await contract.accuracyBps();
    console.log(`  [ledger] ✓ Contract terhubung: ${address}`);
    console.log(`  [ledger] ✓ Keputusan tercatat: ${count} | Akurasi: ${(Number(acc) / 100).toFixed(2)}%`);
    enabled = true;
    return true;
  } catch (e) {
    console.error("  [ledger] ✗ Gagal terhubung ke contract:", e.message);
    return false;
  }
}

// Fungsi utama — dipanggil setiap ada sinyal baru
export async function logDecision(type, confidence, subject) {
  const label = ["SMART_MONEY", "ANOMALY", "WHALE_MOVE"][type] || "UNKNOWN";
  const ts = new Date().toLocaleTimeString();

  if (!enabled || !contract) {
    // Fallback: log ke console saja (tidak gagal)
    console.log(`  [ledger] ${ts} · ${label} (conf ${confidence}%) :: ${subject} — [offline, tidak dicatat on-chain]`);
    return null;
  }

  try {
    // Kirim transaksi ke Mantle — ini yang dicatat PERMANEN
    const tx = await contract.logDecision(type, confidence, subject);
    console.log(`  [ledger] ${ts} · ${label} (conf ${confidence}%) :: ${subject}`);
    console.log(`  [ledger]   → tx: ${tx.hash} (menunggu konfirmasi...)`);

    // Tunggu konfirmasi blok
    const receipt = await tx.wait(1);
    console.log(`  [ledger]   ✓ Tercatat on-chain di blok ${receipt.blockNumber} ✦`);
    return receipt;
  } catch (e) {
    // Kalau transaksi gagal (mis. gas), jangan crash server
    console.error(`  [ledger]   ✗ Gagal catat on-chain: ${e.message}`);
    return null;
  }
}

// Baca status reputasi agent dari contract
export async function getAgentReputation() {
  if (!contract) return null;
  try {
    const count = await contract.decisionCount();
    const acc = await contract.accuracyBps();
    return {
      totalDecisions: Number(count),
      accuracyPercent: (Number(acc) / 100).toFixed(2),
    };
  } catch {
    return null;
  }
}