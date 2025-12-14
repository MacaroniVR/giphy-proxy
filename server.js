import express from "express";
import fetch from "node-fetch";

const app = express();

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("GIF proxy is running");
});

app.get("/search", async (req, res) => {
  const q = req.query.q;
  if (!q) {
    res.status(400).json({ error: "Missing query" });
    return;
  }

  const giphyRes = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=20`
  );

  const json = await giphyRes.json();

  const clean = json.data.map(g => ({
    id: g.id
  }));

  res.json(clean);
});

app.get("/gif/:id", async (req, res) => {
  const id = req.params.id;

  const metaRes = await fetch(
    `https://api.giphy.com/v1/gifs/${id}?api_key=${GIPHY_API_KEY}`
  );

  const meta = await metaRes.json();
  const gifUrl = meta.data.images.original.url;

  const gifRes = await fetch(gifUrl);

  res.setHeader("Content-Type", "image/gif");
  gifRes.body.pipe(res);
});

app.listen(PORT, () => {
  console.log("GIF proxy running on port", PORT);
});
