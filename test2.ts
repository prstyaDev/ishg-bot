import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { env } from './src/config/env';
import { tools } from './src/tools/registry';

const ollama = createOpenAI({
  baseURL: env.OLLAMA_BASE_URL,
  apiKey: 'ollama-local',
  compatibility: 'compatible'
});

async function main() {
  console.log("Starting test...");
  try {
    const result = await generateText({
      model: ollama.chat(env.OLLAMA_MODEL),
      system: `Anda adalah asisten ahli saham IHSG.
TUGAS ANDA:
1. Jika pengguna menanyakan harga saham, panggil tool get_stock_price dengan parameter "symbol".
2. SETELAH menerima data dari tool, tulis analisis teknikal singkat dalam bahasa Indonesia.
3. DILARANG merespons dengan teks kosong.`,
      prompt: "Tolong cek harga saham BBCA dan berikan analisanya.",
      tools: tools,
      maxSteps: 5
    });

    const fs = require('fs');
    fs.writeFileSync('out.json', JSON.stringify({
      text: result.text,
      steps: result.steps
    }, null, 2), 'utf8');
    console.log("Saved to out.json");
    console.log("FINISH REASON:", result.finishReason);
    console.log("TEXT:", result.text?.substring(0, 200));
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
