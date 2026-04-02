import express from 'express';
import { bot } from './bot';
import { env } from './config/env';

const app = express();
app.use(express.json());

if (env.NODE_ENV === 'production') {
  const path = `/webhook/${bot.secretPathComponent()}`;
  app.use(bot.webhookCallback(path));
  
  app.listen(env.PORT, () => {
    console.log(`Server aktif pada port ${env.PORT}`);
  });
} else {
  bot.launch().then(() => {
    console.log('Sistem aktif dalam mode Polling');
  }).catch((err) => {
    console.error('Gagal menjalankan bot:', err);
    process.exit(1);
  });
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));