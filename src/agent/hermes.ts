import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { env } from '../config/env';
import { tools } from '../tools/registry';

const ollama = createOpenAI({
  baseURL: env.OLLAMA_BASE_URL,
  apiKey: 'ollama-local',
  compatibility: 'compatible'
});

export const processQuery = async (input: string, sessionId: string) => {
  try {
    const result = await generateText({
      model: ollama.chat(env.OLLAMA_MODEL),
      system: `Anda adalah asisten ahli saham IHSG. Identifier sesi: ${sessionId}.
TUGAS ANDA:
1. Jika pengguna menanyakan analisis atau harga saham, panggil tool get_stock_price dengan parameter "symbol" berisi kode emiten 4 huruf.
2. SETELAH menerima data dari tool, ANDA WAJIB menuliskan rangkuman dan analisis teknikal singkat berdasarkan data tersebut dalam bahasa Indonesia yang natural.
3. DILARANG KERAS merespons dengan teks kosong.
4. Jika pengguna hanya menyapa, balas dengan ramah tanpa memanggil tool.`,
      prompt: input,
      tools: tools,
      maxSteps: 5,
    });

    if (result.text && result.text.trim() !== '') {
      return result.text;
    }

    let toolData = '';
    for (const step of result.steps) {
      if (step.toolResults && step.toolResults.length > 0) {
        const lastResult = step.toolResults[step.toolResults.length - 1] as any;
        toolData = typeof lastResult.output === 'string'
          ? lastResult.output
          : JSON.stringify(lastResult.output);
      }
    }

    if (toolData) {
      const summary = await generateText({
        model: ollama.chat(env.OLLAMA_MODEL),
        prompt: `${toolData}\n\nBerdasarkan data di atas, berikan analisis teknikal singkat dalam bahasa Indonesia untuk pengguna.`,
      });
      return summary.text;
    }

    return result.text;
  } catch (error) {
    console.error('[AI SDK Error]:', error);
    throw error;
  }
};