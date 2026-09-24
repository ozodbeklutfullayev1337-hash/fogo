require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bot = require('./core/bot');
const clientRoutes = require('./routes/client.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(cors());
app.use(express.json());

// API yo'nalishlari
app.use('/api', clientRoutes);
app.use('/api/admin', adminRoutes);

// Serverni ishga tushirish
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} portida ishga tushdi`);
});

// Telegram botni ishga tushirish
bot.launch()
  .then(() => console.log('Telegram bot muvaffaqiyatli ulandi!'))
  .catch((err) => console.error('Bot ishga tushishida xatolik:', err.message));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));