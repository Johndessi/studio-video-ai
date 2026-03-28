const express = require("express");
const https = require("https");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/claude", (req, res) => {
  if (!API_KEY) return res.status(500).json({ error: "Clé API manquante" });
  const body = JSON.stringify({
    model: req.body.model || "claude-sonnet-4-20250514",
    max_tokens: req.body.max_tokens || 2000,
    system: req.body.system || "",
    messages: req.body.messages || [],
    stream: true,
  });
  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Length": Buffer.byteLength(body),
    },
  };
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Access-Control-Allow-Origin", "*");
  const apiReq = https.request(options, apiRes => {
    apiRes.on("data", chunk => res.write(chunk));
    apiRes.on("end", () => res.end());
  });
  apiReq.on("error", err => res.status(500).end());
  apiReq.write(body);
  apiReq.end();
});

app.options("/api/claude", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.status(204).end();
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`🎬 Studio lancé sur port ${PORT}`));
