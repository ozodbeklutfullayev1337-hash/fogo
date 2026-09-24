const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
  console.log(`[TELEGRAM START] Yangi foydalanuvchi start bosdi: ID = ${userId}, User = ${username}`);
  ctx.reply(`Salom! Sizning Telegram ID raqamingiz: ${userId}`);
});

module.exports = bot;