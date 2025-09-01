require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigin = "https://a-godzo.github.io";
app.use(cors({ origin: allowedOrigin }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.json());
app.use(express.static(__dirname));

const FALLBACK_PROMPT = "A comic panel in black and white style";
const MAX_PANELS = 4;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/generate-comic', async (req, res) => {
  let { prompts } = req.body;
  const results = [];

  try {

    if (!Array.isArray(prompts)) {
      console.warn("Prompts was not an array. Defaulting to single fallback.");
      prompts = [FALLBACK_PROMPT];
    }

    if (prompts.length > MAX_PANELS) {
      console.warn(`Too many prompts (${prompts.length}). Limiting to ${MAX_PANELS}.`);
      prompts = prompts.slice(0, MAX_PANELS);
    }


    const imagePromises = prompts.map(async (raw) => {
     const prompt = (typeof raw === 'string' && raw.trim()) ? raw.trim() : FALLBACK_PROMPT;
      console.log("➡️ Sending prompt:", prompt);

      const resp = await client.images.generate({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024",
      });

      const b64 = resp.data?.[0]?.b64_json;
      if (!b64) throw new Error("No image returned from OpenAI");

      return `data:image/png;base64,${b64}`;
    });

    const results = await Promise.all(imagePromises);
    res.json({ images: results });


  } catch (err) {
  console.error("🔥 Fatal server error:", err);

  if (err.response) {
    res.status(err.response.status).json({
      error: err.response.data || err.message
    });
  } else {
    res.status(500).json({ error: err.message });
  }
}
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
