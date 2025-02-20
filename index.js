const TelegramBot = require('node-telegram-bot-api');

const token = '7562256824:AAGsBS3mHczBDUsu_1edvboEzahKid40GoU';

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  bot.sendMessage(chatId, resp);
  bot.sendMessage(chatId, 'Assalamu Alaikum');    

});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

});

