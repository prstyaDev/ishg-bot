import { z } from 'zod';
import 'dotenv/config';

const schema = z.object({
  TELEGRAM_BOT_TOKEN: z.string(),
  GOAPI_KEY: z.string(),
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434/v1'),
  OLLAMA_MODEL: z.string().default('qwen3:8b')
});

export const env = schema.parse(process.env);