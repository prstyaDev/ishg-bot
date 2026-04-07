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
      system: `Anda adalah Hermes, asisten ahli saham IHSG. Identifier sesi: ${sessionId}.

TOOLS YANG TERSEDIA:
1. get_stock_price — Cek harga saham terkini (parameter: symbol)
2. get_market_summary — Saham trending & ringkasan pasar IHSG hari ini (tanpa parameter)
3. get_top_movers — Daftar Top Gainer & Top Loser hari ini (tanpa parameter)
4. compare_emiten — Bandingkan dua saham side-by-side (parameter: symbol1, symbol2)
5. get_historical_data — Data historis harga 30 hari terakhir untuk analisis tren (parameter: symbol)
6. get_fundamentals — Profil perusahaan & rasio keuangan PER, PBV, ROE, EPS (parameter: symbol)
7. get_broker_summary — Analisis bandarmologi: aktivitas broker lokal/asing (parameter: symbol, date?, investor?)

ATURAN:
1. Pilih tool yang paling relevan berdasarkan pertanyaan pengguna. Boleh memanggil lebih dari satu tool jika diperlukan.
2. SETELAH menerima data dari tool, ANDA WAJIB menuliskan rangkuman dan analisis dalam bahasa Indonesia yang natural dan informatif.
3. DILARANG KERAS merespons dengan teks kosong.
4. Jika pengguna hanya menyapa, balas dengan ramah tanpa memanggil tool.
5. Jika pengguna bertanya tentang kondisi pasar umum atau trending, gunakan get_market_summary.
6. Jika pengguna bertanya saham naik/turun terbanyak, gunakan get_top_movers.
7. Jika pengguna minta perbandingan dua saham, gunakan compare_emiten.
8. Jika pengguna minta analisa teknikal atau tren historis, gunakan get_historical_data.
9. Jika pengguna bertanya tentang valuasi/fundamental/profil perusahaan, gunakan get_fundamentals.
10. Jika pengguna bertanya tentang bandar, broker, asing masuk/keluar, akumulasi/distribusi, gunakan get_broker_summary.`,
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