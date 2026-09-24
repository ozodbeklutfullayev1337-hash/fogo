import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/client.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { bot } from './core/bot.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS sozlamasi (Frontend so'rovlarini qabul qilish uchun)
app.use(cors({ origin: '*' }));
app.use(express.json());

// Marshrutlar (Routes)
app.use('/api', clientRoutes);
app.use('/api/admin', adminRoutes);

// Server holatini tekshirish
app.get('/', (req, res) => {
  res.json({ message: 'FOGO Fast Food API ishlab turibdi 🚀' });
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda muvaffaqiyatli ishga tushdi`);
});

// Telegram botni ishga tushirish
if (bot && typeof bot.launch === 'function') {
  bot.launch()
    .then(() => console.log('Telegram Bot muvaffaqiyatli ishga tushdi 🤖'))
    .catch((err) => console.error('Bot ishga tushishida xatolik:', err));
}