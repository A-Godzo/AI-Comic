
//     //https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large -- Stable diffusion 3.5 large slow but ok
//     //https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4 ----------- Stable diffusion 1.4 same as 1
//     //https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V1.4 ---------- Realistic Vision 1.4 shit pics
//     //https://api-inference.huggingface.co/models/stabilityai/sd-turbo -------------------- Stable diffusion turbo very shit images
//     //https://api-inference.huggingface.co/models/gsdf/Counterfeit-V3.0 ------------------- Counterfeit 3.0 very promising fast but not flawless [removed]
//     //https://api-inference.huggingface.co/models/dreamlike-art/dreamlike-photoreal-2.0 ---- 

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // where your index.html lives

app.post('/generate-comic', async (req, res) => {
  const { prompts } = req.body;
  const results = [];

  try {
    for (let prompt of prompts) {
      const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      });

      console.log("Prompt:", prompt);
      console.log("Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error text:", errorText);
        return res.status(response.status).json({ error: errorText });
      }

      const buffer = await response.buffer();
      const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;
      results.push(base64Image);
    }

    res.json({ images: results });
  } catch (err) {
    console.error("Fatal server error:", err);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});