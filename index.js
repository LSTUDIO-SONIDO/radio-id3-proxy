import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("🟢 ID3 Proxy activo y funcionando.");
});

app.get("/id3", async (req, res) => {
  const streamUrl = req.query.url;
  if (!streamUrl) {
    return res.status(400).json({ error: "Falta parámetro 'url'" });
  }

  try {
    const response = await fetch(streamUrl, { headers: { 'Icy-MetaData': '1' } });
    const icyMetaInt = response.headers.get("icy-metaint");

    if (!icyMetaInt) {
      return res.json({ error: "El servidor no envía metadatos ICY" });
    }

    const buffer = await response.arrayBuffer();
    const data = Buffer.from(buffer);

    const metaInt = parseInt(icyMetaInt);
    const metadataBlock = data.subarray(metaInt, metaInt + 4080).toString("utf8");

    const match = metadataBlock.match(/StreamTitle='([^']*)';/);
    const streamTitle = match ? match[1] : "Sin metadatos";

    res.json({ StreamTitle: streamTitle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener metadatos", detalle: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor ID3 Proxy escuchando en puerto ${PORT}`));
