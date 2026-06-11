# OBSCURA — On-Chain Intelligence Agent

<div align="center">

![OBSCURA Banner](https://img.shields.io/badge/OBSCURA-On--Chain%20Intelligence-00ff94?style=for-the-badge&labelColor=050507&color=00ff94)

**The hidden, made visible.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-getobscura.vercel.app-00ff94?style=flat-square&labelColor=050507)](https://getobscura.vercel.app)
[![Mantle Sepolia](https://img.shields.io/badge/Contract-Mantle%20Sepolia-00ff94?style=flat-square&labelColor=050507)](https://sepolia.mantlescan.xyz/address/0x1E375B72Aa2d8dF87AA97DBa506C22311Efc6148)
[![GitHub](https://img.shields.io/badge/GitHub-dafariel278%2Fobscura-white?style=flat-square&labelColor=050507)](https://github.com/dafariel278/obscura)
[![ERC-8004](https://img.shields.io/badge/Identity-ERC--8004-00e5ff?style=flat-square&labelColor=050507)](https://sepolia.mantlescan.xyz/address/0x1E375B72Aa2d8dF87AA97DBa506C22311Efc6148)
[![Track](https://img.shields.io/badge/Track-AI%20Alpha%20%26%20Data-ff6b35?style=flat-square&labelColor=050507)](https://dorahacks.io/hackathon/mantleturingtesthackathon2026)

*Built for The Turing Test Hackathon 2026 — Mantle Network*

</div>

---

## What is OBSCURA?

OBSCURA is an **autonomous on-chain intelligence agent** built natively on Mantle. It monitors smart money movements across 8 blockchain networks in real-time — detecting accumulation patterns, whale activity, and on-chain anomalies — then predicts capital inflows into Mantle before the market notices.

Unlike traditional analytics dashboards that show you what *already happened*, OBSCURA is designed to tell you what is *about to happen* — by watching where smart money positions itself across chains before bridging into Mantle.

> *"ob·scu·ra — the hidden, made visible."*

**[→ Try OBSCURA live at getobscura.vercel.app](https://getobscura.vercel.app)**

---

## The Problem

On-chain markets are dominated by information asymmetry. Sophisticated wallets with historical win-rates of 80%+ move silently across multiple chains, accumulating positions long before retail participants notice. Existing analytics tools suffer from three critical gaps:

- **Single-chain blindness** — they track one chain at a time, missing cross-chain capital flows entirely
- **Reactive, not predictive** — they show what already happened, not where money is heading next
- **No verifiable AI track record** — every analytics tool *claims* accuracy, but none can *prove* it on-chain

OBSCURA was built to close all three gaps simultaneously.

---

## How It Works

OBSCURA operates across four interconnected layers:

### Layer 1 — Eyes (Data Indexing)
OBSCURA connects to 8 blockchain networks in parallel and reads every new block in real-time. Each transaction is parsed for token transfers, wallet behavior, and liquidity movements. The agent maintains a live map of on-chain activity across the entire multi-chain landscape.

**Chains monitored:**
| Chain | Type | Color |
|-------|------|-------|
| Mantle | EVM (Home) | 🟢 |
| Ethereum | EVM | 🔵 |
| Base | EVM | 🔷 |
| BSC | EVM | 🟡 |
| Polygon | EVM | 🟣 |
| Arbitrum | EVM | 🩵 |
| Optimism | EVM | 🔴 |
| Solana | SVM (non-EVM) | 🟩 |

### Layer 2 — Brain (Smart-Money Scoring)
Every wallet that interacts with monitored chains is scored using a proprietary algorithm that evaluates:
- **Transaction frequency** — how actively the wallet trades
- **Token diversity** — breadth of assets touched (early movers discover new tokens)
- **Temporal consistency** — sustained activity vs. one-time spikes

Wallets crossing a confidence threshold are added to the live watchlist. The scoring system is chain-agnostic by design — the same model runs across all 8 networks simultaneously.

### Layer 3 — Memory (On-Chain Decision Ledger) ★
This is OBSCURA's most critical and unique feature.

Every intelligence decision OBSCURA makes — classifying a signal as smart money, anomaly, or whale move — is written **permanently to Mantle** via the `ObscuraLedger.sol` smart contract. Each logged decision contains:

```
- Timestamp (block-level precision)
- Signal type: SmartMoney | Anomaly | WhaleMove
- Confidence score (0-100)
- Subject (wallet/token identifier)
- Resolution status (correct/incorrect — updated later)
```

This creates an **immutable, publicly verifiable track record** that any third party can audit. OBSCURA's accuracy is not a marketing claim — it is a fact recorded on a blockchain.

### Layer 4 — Voice (LLM Reasoning Core)
Raw on-chain data is transformed into human-readable intelligence via an LLM reasoning core powered by OpenRouter. Traders can query OBSCURA directly:

```
> what is smart money doing right now?
> which wallets are about to bridge to Mantle?
> is there a rug pull pattern on $AGNI?
```

OBSCURA responds as a sharp, confident on-chain analyst — no disclaimers, no hedging, just signal.

---

## What Makes OBSCURA Unique

### 1. Verifiable On-Chain Track Record
OBSCURA is the **only on-chain analytics agent whose decisions are recorded on the blockchain**. Every other tool makes predictions that disappear into the void. OBSCURA's decisions live forever at:

```
0x1E375B72Aa2d8dF87AA97DBa506C22311Efc6148 (Mantle Sepolia)
```

[Verify on Mantle Explorer →](https://sepolia.mantlescan.xyz/address/0x1E375B72Aa2d8dF87AA97DBa506C22311Efc6148)

### 2. Cross-Chain Capital Flow Prediction
OBSCURA's core alpha: detecting smart money that is positioned on Ethereum, Polygon, or Solana — and predicting when that capital will bridge into Mantle. By the time the bridge transaction confirms, OBSCURA users already know.

### 3. ERC-8004 Agent Identity
OBSCURA holds a unique on-chain identity NFT per the ERC-8004 standard. This identity accumulates reputation over time based on verified decision accuracy. The longer OBSCURA runs, the stronger its verifiable track record — creating a compounding moat that cannot be replicated overnight.

### 4. The Moat That Grows
Unlike software features that competitors can copy in weeks, OBSCURA's on-chain decision history requires *time* to accumulate. A competitor launching tomorrow starts with zero track record. OBSCURA's accuracy score is permanently ahead.

### 5. Full Multi-Chain Awareness (EVM + SVM)
Most agents are EVM-only. OBSCURA bridges the gap to Solana via a dedicated SVM adapter, recognizing that some of the most significant capital flows originate from non-EVM ecosystems. Cross-chain Solana → Mantle signals are detected via Wormhole bridge pattern recognition.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   OBSCURA Agent                       │
│                                                       │
│  ┌─────────┐    ┌─────────┐    ┌──────────────────┐  │
│  │  EYES   │───▶│  BRAIN  │───▶│     MEMORY       │  │
│  │         │    │         │    │                  │  │
│  │ 8-chain │    │ Wallet  │    │ ObscuraLedger    │  │
│  │ RPC     │    │ scoring │    │ .sol on Mantle   │  │
│  │ indexer │    │ engine  │    │ (every decision  │  │
│  │         │    │         │    │  logged forever) │  │
│  └─────────┘    └────┬────┘    └──────────────────┘  │
│                      │                               │
│                 ┌────▼────┐                          │
│                 │  VOICE  │                          │
│                 │         │                          │
│                 │ LLM via │                          │
│                 │OpenRoute│                          │
│                 └────┬────┘                          │
│                      │                               │
└──────────────────────┼──────────────────────────────┘
                        │
              ┌─────────▼─────────┐
              │  Terminal Dashboard│
              │  getobscura.       │
              │  vercel.app        │
              └───────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.20 · `ObscuraLedger.sol` on Mantle Sepolia |
| Blockchain Interaction | Ethers.js v6 · Multi-RPC fallback architecture |
| Backend | Node.js · Express · Vercel Serverless Functions |
| AI Reasoning | OpenRouter API · 5-model fallback chain |
| Frontend | Vanilla JS · Matrix-style terminal UI |
| Deployment | Vercel (frontend + API) · GitHub Codespaces (dev) |
| Identity | ERC-8004 Agent NFT |

---

## Smart Contract

**ObscuraLedger** — the on-chain memory of OBSCURA's decisions.

```solidity
// Every agent decision is permanent and verifiable
function logDecision(
    SignalType signalType,  // SmartMoney | Anomaly | WhaleMove
    uint8 confidence,       // 0-100 confidence score
    string calldata subject // wallet/token being analyzed
) external onlyAgent returns (uint256 decisionId)
```

```
Network:  Mantle Sepolia Testnet
Chain ID: 5003
Address:  0x1E375B72Aa2d8dF87AA97DBa506C22311Efc6148
```

[View on Mantle Explorer →](https://sepolia.mantlescan.xyz/address/0x1E375B72Aa2d8dF87AA97DBa506C22311Efc6148)

---

## Getting Started

### Prerequisites
- Node.js 18+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/dafariel278/obscura.git
cd obscura/obscura-final

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your RPC endpoints and API keys
```

### Environment Variables

```env
# Required
MANTLE_RPC=https://rpc.mantle.xyz

# Optional — enables AI reasoning core
OPENROUTER_API_KEY=sk-or-v1-...

# Required for on-chain decision logging
PRIVATE_KEY=0x...          # Test wallet only
LEDGER_ADDRESS=0x...       # Deployed contract address
```

### Running OBSCURA

```bash
# Verify everything is configured correctly
npm run check

# Test Mantle connection
npm run ping

# Scan live block transfers
npm run scan

# Run smart-money scoring
npm run score

# Launch full dashboard with live data
npm run server
# → Open http://localhost:3000
```

### Deploy Smart Contract

```bash
# Compile contract
npm run compile

# Deploy to Mantle Sepolia (requires test MNT from faucet)
npm run deploy
# → Contract address will be printed — save to .env as LEDGER_ADDRESS
```

---

## Project Structure

```
obscura-final/
├── src/
│   ├── chains.js          # Multi-chain configuration (7 EVM + Solana)
│   ├── provider.js        # Multi-RPC fallback provider
│   ├── smartmoney.js      # Wallet scoring engine
│   ├── ledger.js          # On-chain decision logging
│   ├── ai.js              # AI narrative layer
│   └── server.js          # Express backend + API routes
├── api/
│   ├── query.js           # /api/query — Reasoning Core (Vercel function)
│   ├── watchlist.js       # /api/watchlist — Smart money data
│   ├── feed.js            # /api/feed — Intelligence feed
│   └── status.js          # /api/status — Agent health check
├── contracts/
│   └── ObscuraLedger.sol  # On-chain decision ledger contract
├── scripts/
│   ├── compile.js         # Contract compiler
│   └── deploy.js          # Contract deployer
├── public/
│   └── index.html         # Terminal dashboard UI
└── vercel.json            # Vercel deployment config
```

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Agent status and contract info |
| `/api/watchlist` | GET | Live smart-money wallet rankings |
| `/api/feed` | GET | Intelligence feed events |
| `/api/query` | POST | Query the AI reasoning core |

**Query the reasoning core:**
```bash
curl -X POST https://getobscura.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "what is smart money doing right now?"}'
```

---

## Live Demo

**[→ https://getobscura.vercel.app](https://getobscura.vercel.app)**

The live dashboard features:
- **Matrix-style terminal UI** with real-time animated feed
- **Smart Money Watchlist** — wallets scored from live Mantle data
- **Intelligence Feed** — streaming smart money, whale, and anomaly events across 8 chains
- **Chain Selector** — filter by Mantle, Ethereum, Base, BSC, Polygon, Arbitrum, Optimism, or Solana
- **Reasoning Core** — ask OBSCURA anything about current on-chain activity
- **Cross-chain signals** — capital flows detected moving toward Mantle

---

## Hackathon Submission

| Field | Value |
|-------|-------|
| **Event** | The Turing Test Hackathon 2026 |
| **Organizer** | Mantle Network × DoraHacks |
| **Track** | AI Alpha & Data |
| **Demo** | [getobscura.vercel.app](https://getobscura.vercel.app) |
| **Contract** | `0x1E375B72Aa2d8dF87AA97DBa506C22311Efc6148` |
| **Network** | Mantle Sepolia Testnet (Chain ID: 5003) |
| **Explorer** | [View on Mantle Sepolia →](https://sepolia.mantlescan.xyz/address/0x1E375B72Aa2d8dF87AA97DBa506C22311Efc6148) |

---

## Builder

Built solo by **[@0xDafariel](https://x.com/0xDafariel)** — Web3 strategist and ecosystem architect active since 2019.

---

## License

MIT © 2026 OBSCURA

---

<div align="center">

**OBSCURA — The hidden, made visible.**

[Live Demo](https://getobscura.vercel.app) · [Contract](https://sepolia.mantlescan.xyz/address/0x1E375B72Aa2d8dF87AA97DBa506C22311Efc6148) · [Twitter](https://x.com/0xDafariel)

*Every agent decision recorded on-chain · Identity: ERC-8004 NFT #0xOBS*

</div>
