export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({
    agent: "OBSCURA",
    chain: "Mantle",
    chainId: 5000,
    online: true,
    contract: process.env.LEDGER_ADDRESS || null,
    mode: "vercel-serverless",
  });
}