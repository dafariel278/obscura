// ============================================================
// OBSCURA · Konfigurasi chain terpusat
// Semua chain EVM yang dipantau OBSCURA. Mantle adalah "rumah".
// Solana (non-EVM) ditangani terpisah — lihat catatan di README.
// ============================================================

export const CHAINS = {
  mantle: {
    name: "Mantle",
    chainId: 5000,
    color: "#00ff8c",
    home: true,
    rpcEnv: "MANTLE_RPC",
    rpcDefault: "https://rpc.mantle.xyz",
    explorer: "https://mantlescan.xyz",
  },
  ethereum: {
    name: "Ethereum",
    chainId: 1,
    color: "#6c8eef",
    rpcEnv: "ETHEREUM_RPC",
    rpcDefault: "https://eth.llamarpc.com",
    explorer: "https://etherscan.io",
  },
  base: {
    name: "Base",
    chainId: 8453,
    color: "#0052ff",
    rpcEnv: "BASE_RPC",
    rpcDefault: "https://mainnet.base.org",
    explorer: "https://basescan.org",
  },
  bsc: {
    name: "BSC",
    chainId: 56,
    color: "#f0b90b",
    rpcEnv: "BSC_RPC",
    rpcDefault: "https://bsc-dataseed.binance.org",
    explorer: "https://bscscan.com",
  },
  polygon: {
    name: "Polygon",
    chainId: 137,
    color: "#a06bff",
    rpcEnv: "POLYGON_RPC",
    rpcDefault: "https://polygon-rpc.com",
    explorer: "https://polygonscan.com",
  },
  arbitrum: {
    name: "Arbitrum",
    chainId: 42161,
    color: "#28a0f0",
    rpcEnv: "ARBITRUM_RPC",
    rpcDefault: "https://arb1.arbitrum.io/rpc",
    explorer: "https://arbiscan.io",
  },
  optimism: {
    name: "Optimism",
    chainId: 10,
    color: "#ff0420",
    rpcEnv: "OPTIMISM_RPC",
    rpcDefault: "https://mainnet.optimism.io",
    explorer: "https://optimistic.etherscan.io",
  },
};

export function rpcFor(chainKey, env) {
  const c = CHAINS[chainKey];
  if (!c) throw new Error(`Chain tidak dikenal: ${chainKey}`);
  return env[c.rpcEnv] || c.rpcDefault;
}
