// ============================================================
// OBSCURA · Helper provider tahan-banting
// Mencoba beberapa RPC publik bergantian kalau salah satu gagal,
// jadi kamu tidak terjebak error koneksi saat memakai endpoint gratis.
// ============================================================
import { ethers } from "ethers";

// Daftar RPC publik Mantle (urutan dicoba dari atas).
// Endpoint pertama memakai nilai .env kalau ada.
const MANTLE_RPCS = [
  "https://rpc.mantle.xyz",
  "https://mantle.drpc.org",
  "https://1rpc.io/mantle",
  "https://mantle-mainnet.public.blastapi.io",
];

export async function getMantleProvider(env = {}) {
  const list = env.MANTLE_RPC ? [env.MANTLE_RPC, ...MANTLE_RPCS] : MANTLE_RPCS;
  let lastErr;
  for (const url of list) {
    try {
      const provider = new ethers.JsonRpcProvider(url, undefined, { staticNetwork: true });
      // Uji cepat: ambil blockNumber dengan timeout 8 detik
      const bn = await Promise.race([
        provider.getBlockNumber(),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 8000)),
      ]);
      if (typeof bn === "number") {
        return { provider, url };
      }
    } catch (e) {
      lastErr = e;
      console.log(`  (RPC gagal: ${url} — mencoba berikutnya...)`);
    }
  }
  throw new Error("Semua RPC publik gagal. Isi MANTLE_RPC pribadi di .env. Detail: " + (lastErr?.message || ""));
}
