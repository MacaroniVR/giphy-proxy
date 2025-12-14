import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
const PORT = process.env.PORT || 3000;

/* =========================
   CORS CONFIGURATION
   ========================= */
app.use(
  cors({
    origin: [
      "https://catbadtime.web.app",
      "https://catbadtime.firebaseapp.com",
      "http://localhost:5500",
      "http://localhost:3000"
    ],
    methods: ["GET"],
    allowedHeaders: ["Content-Type"]
  })
);

/* =========================
   HEALTH CHECK
   ========================= */
app.get("/", (req, res) => {
  res.send("GIF proxy is running");
});

/* =========================
   SEARCH ENDPOINT
   ========================= */
app.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) {
      res.status(400).json({ error: "Missing query" });
      return;
    }

    const giphyRes = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
        q
      )}&limit=20`
    );

    const json = await giphyRes.json();

    const clean = json.data.map(g => ({
      id: g.id
    }));

    res.json(clean);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

/* =========================
   GIF STREAM PROXY
   ========================= */
app.get("/gif/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const metaRes = await fetch(
      `https://api.giphy.com/v1/gifs/${id}?api_key=${GIPHY_API_KEY}`
    );

    const meta = await metaRes.json();
    const gifUrl = meta.data.images.original.url;

    const gifRes = await fetch(gifUrl);

    res.setHeader("Content-Type", "image/gif");
    gifRes.body.pipe(res);
  } catch (err) {
    console.error("GIF proxy error:", err);
    res.status(500).send("GIF load failed");
  }
});

/* =========================
   START SERVER
   ========================= */
app.listen(PORT, () => {
  console.log(`GIF proxy running on port ${PORT}`);
});
