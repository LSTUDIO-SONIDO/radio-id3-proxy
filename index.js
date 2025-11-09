import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ error: "Falta parámetro 'url'" });

  try {
    const response = await fetch(url, {
      headers: { "Icy-MetaData": "1", "User-Agent": "Mozilla/5.0" }
    });

    // Leemos sólo los primeros 32 KB
    const reader = response.body.getReader();
    const { value } = await reader.read();
    const text = Buffer.from(value).toString("binary");

    const match = text.match(/StreamTitle='([^']*)';/i);
    const title = match ? match[1] : "Sin metadatos";

    res.json({ StreamTitle: title });
  } catch (e) {
    res.json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor ID3 listo 🎧 en puerto ${PORT}`));


