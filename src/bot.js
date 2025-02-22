// const TelegramBot = require('node-telegram-bot-api');

// const token = '7562256824:AAGsBS3mHczBDUsu_1edvboEzahKid40GoU';

// const bot = new TelegramBot(token, {polling: true});

// bot.onText(/\/echo (.+)/, (msg, match) => {

//   const chatId = msg.chat.id;
//   const resp = match[1]; // the captured "whatever"

//   bot.sendMessage(chatId, resp);
// });

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   bot.sendMessage(chatId, 'Received your message');
// });

const TelegramBot = require("node-telegram-bot-api");
const { db, collection, addDoc, getDocs, query, orderBy } = require("./firebase");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "🌍 Assalomu alaykum! Bu Eco Tracker bot. \n" +
    "♻ Siz ekologik muammolarni xabar bera olasiz. \n\n" +
    "➕ Yangi muammo qo'shish uchun /add \n" +
    "📋 Barcha muammolarni ko'rish uchun /issues");
});

// 🌱 **Yangi muammo qo‘shish**
bot.onText(/\/add/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "📌 Muammo nomini yozing:");
  
  bot.once("message", async (response) => {
    const issueTitle = response.text;
    bot.sendMessage(chatId, "📄 Muammo tavsifini yozing:");

    bot.once("message", async (descResponse) => {
      const issueDescription = descResponse.text;

      try {
        await addDoc(collection(db, "issues"), {
          username: msg.from.username || msg.from.first_name,
          title: issueTitle,
          description: issueDescription,
          createdAt: new Date()
        });

        bot.sendMessage(chatId, "✅ Muammo muvaffaqiyatli qo‘shildi!");
      } catch (error) {
        console.error("❌ Xatolik:", error);
        bot.sendMessage(chatId, "❌ Xatolik yuz berdi, qaytadan urinib ko‘ring.");
      }
    });
  });
});

// 📊 **Barcha muammolarni ko‘rish**
bot.onText(/\/issues/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      bot.sendMessage(chatId, "❌ Hech qanday muammo topilmadi.");
      return;
    }

    let issuesList = "📋 **Barcha muammolar:**\n\n";
    querySnapshot.forEach((doc) => {
      const issue = doc.data();
      issuesList += `📌 *${issue.title}* \n📝 ${issue.description} \n👤 ${issue.username} \n📅 ${new Date(issue.createdAt.toDate()).toLocaleString()}\n\n`;
    });

    bot.sendMessage(chatId, issuesList, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("❌ Xatolik:", error);
    bot.sendMessage(chatId, "❌ Xatolik yuz berdi, qaytadan urinib ko‘ring.");
  }
});
