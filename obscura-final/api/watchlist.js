import { MANTLE_RPCS, TRANSFER_TOPIC } from "./_config.js";

const short = (a) => a.slice(0, 6) + "..." + a.slice(-4);

async function rpcCall(url, method, params) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.result;
}

async function getProvider() {
  const rpcs = process.env.MANTLE_RPC
    ? [process.env.MANTLE_RPC, ...MANTLE_RPCS]
    : MANTLE_RPCS;
  for (const url of rpcs) {
    try {
      const bn = await Promise.race([
        rpcCall(url, "eth_blockNumber", []),
        new Promise((_, r) => setTimeout(() => r(new Error("timeout")), 6000)),
      ]);
      if (bn) return { url, latestHex: bn };
    } catch { /* try next */ }
  }
  throw new Error("All RPCs failed");
}

const hexToNum = (h) => parseInt(h, 16);
const numToHex = (n) => "0x" + n.toString(16);

function computeScore(w) {
  const activity = Math.min(w.txCount / 20, 1) * 40;
  const diversity = Math.min(w.tokens.size / 8, 1) * 35;
  const span = (w.lastBlock ?? 0) - (w.firstBlock ?? 0);
  const consistency = Math.min(span / 40, 1) * 25;
  return Math.max(0, Math.min(100, Math.round(activity + diversity + consistency)));
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const { url, latestHex } = await getProvider();
    const latest = hexToNum(latestHex);
    const fromBlock = Math.max(0, latest - 40);

    const logs = await rpcCall(url, "eth_getLogs", [{
      fromBlock: numToHex(fromBlock),
      toBlock: latestHex,
      topics: [TRANSFER_TOPIC],
    }]);

    const wallets = new Map();
    const touch = (addr) => {
      if (!wallets.has(addr))
        wallets.set(addr, { addr, txCount: 0, tokens: new Set(), firstBlock: null, lastBlock: null });
      return wallets.get(addr);
    };

    for (const log of (logs || [])) {
      if (log.topics.length < 3) continue;
      const from = "0x" + log.topics[1].slice(26);
      const to   = "0x" + log.topics[2].slice(26);
      const bn   = hexToNum(log.blockNumber);
      for (const a of [from, to]) {
        if (a === "0x0000000000000000000000000000000000000000") continue;
        const w = touch(a.toLowerCase());
        w.txCount++;
        w.tokens.add(log.address.toLowerCase());
        if (w.firstBlock === null || bn < w.firstBlock) w.firstBlock = bn;
        if (w.lastBlock  === null || bn > w.lastBlock)  w.lastBlock  = bn;
      }
    }

    const ranked = [...wallets.values()]
      .filter((w) => w.txCount >= 2)
      .map((w) => ({
        addr: w.addr,
        addrShort: short(w.addr),
        score: computeScore(w),
        txCount: w.txCount,
        tokenCount: w.tokens.size,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    res.json({ watchlist: ranked, updated: Date.now(), block: latest });
  } catch (e) {
    res.status(500).json({ error: e.message, watchlist: [] });
  }
}