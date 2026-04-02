import axios from 'axios';
import { tool, jsonSchema } from 'ai';
import { env } from '../config/env';

const api = axios.create({
  baseURL: 'https://api.goapi.io/stock/idx',
  headers: {
    'X-API-KEY': env.GOAPI_KEY,
    'Accept': 'application/json'
  },
  timeout: 15000
});

export const getPrice = tool({
  description: 'Mendapatkan harga saham terkini berdasarkan kode emiten 4 huruf. Contoh: BBCA, BBRI, TLKM',
  parameters: jsonSchema({
    type: 'object',
    properties: {
      symbol: {
        type: 'string',
        description: 'Kode emiten saham 4 huruf, contoh: BBCA, BBRI, TLKM'
      }
    },
    required: ['symbol'],
    additionalProperties: false
  }),
  execute: async ({ symbol }: { symbol: string }) => {
    try {
      const { data } = await api.get('/prices', {
        params: { symbols: symbol.toUpperCase() }
      });
      console.log('[GoAPI Response]:', JSON.stringify(data, null, 2));
      const result = data?.data?.results?.[0] || data?.data || data;
      const closePrice = result?.close ?? result?.price ?? 'Tidak diketahui';
      const high = result?.high ?? '-';
      const low = result?.low ?? '-';
      const open = result?.open ?? '-';
      const volume = result?.volume ?? '-';
      const change = result?.change ?? '-';
      const changePct = result?.change_pct ?? '-';
      return `[SYSTEM DATA] Emiten: ${symbol.toUpperCase()}, Harga Terakhir: ${closePrice}, Open: ${open}, High: ${high}, Low: ${low}, Volume: ${volume}, Perubahan: ${change} (${changePct}%). Tolong berikan analisa teknikal singkat berdasarkan angka-angka ini.`;
    } catch (err: any) {
      console.error('[GoAPI Error]:', err?.response?.status, err?.response?.data || err?.message);
      return '[SYSTEM ERROR] Data emiten gagal ditarik dari bursa';
    }
  }
});

export const tools = {
  get_stock_price: getPrice
};