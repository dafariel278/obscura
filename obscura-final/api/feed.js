export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({
    feed: [],
    updated: Date.now(),
  });
}