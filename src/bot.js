const TelegramBot = require("node-telegram-bot-api");
const { db, collection, addDoc, getDocs, query, orderBy } = require("./firebase");
require("dotenv").config();

const bot = new TelegramBot("7763969768:AAHGr47FyDCgA0NY3YZSwbBCHxETcgF8QTo", { polling: true });

const escapeMarkdown = (text) => {
  return text
    .replace(/([_*[\]()~>#+-=|{}.!])/g, "\\$1"); // Barcha maxsus belgilarni escapelash
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "🌍 Assalomu alaykum! Bu Eco Tracker bot. \n" +
    "♻ Siz ekologik muammolarni xabar bera olasiz. \n\n" +
    "➕ Yangi muammo qo'shish uchun /add \n" +
    "📋 Barcha muammolarni ko'rish uchun /issues");
});


const userStates = {};
const db = require("./firebase"); // Firebase config

// 📌 1️⃣ /add – Yangi muammo qo‘shish
bot.onText(/\/add/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Muammo matnini kiriting:");
  userStates[chatId] = "waiting_for_issue";
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (userStates[chatId] === "waiting_for_issue") {
    const issueText = msg.text;

    const newIssue = await db.collection("issues").add({
      text: issueText,
      importance: 0,
      createdAt: new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" }),
      userId: chatId,
    });

    bot.sendMessage(chatId, `Muammo qo'shildi: ${issueText}`, {
      reply_markup: {
        inline_keyboard: [[{ text: "⬆ Dolzarb", callback_data: `upvote_${newIssue.id}` }]],
      },
    });

    delete userStates[chatId];
  }
});

// 📌 2️⃣ /issues – Barcha muammolarni chiqarish (author bo‘lsa "O‘chirish" tugmasi chiqadi)
bot.onText(/\/issues/, async (msg) => {
  const chatId = msg.chat.id;
  const issuesSnapshot = await db.collection("issues").orderBy("importance", "desc").get();

  if (issuesSnapshot.empty) {
    return bot.sendMessage(chatId, "Hozircha muammolar mavjud emas.");
  }

  issuesSnapshot.forEach((doc) => {
    const issue = doc.data();
    const issueId = doc.id;
    const isAuthor = issue.userId === chatId;

    let buttons = [[{ text: "⬆ Dolzarb", callback_data: `upvote_${issueId}` }]];
    if (isAuthor) {
      buttons.push([{ text: "🗑 O‘chirish", callback_data: `delete_${issueId}` }]);
    }

    bot.sendMessage(chatId, `📌 *${issue.text}*\n🕒 ${issue.createdAt}`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: buttons },
    });
  });
});

// 📌 3️⃣ /my_issues – Faqat foydalanuvchiga tegishli muammolarni chiqarish
bot.onText(/\/my_issues/, async (msg) => {
  const chatId = msg.chat.id;
  const issuesSnapshot = await db.collection("issues").where("userId", "==", chatId).get();

  if (issuesSnapshot.empty) {
    return bot.sendMessage(chatId, "Siz hech qanday muammo qo‘shmagansiz.");
  }

  issuesSnapshot.forEach((doc) => {
    const issue = doc.data();
    const issueId = doc.id;

    bot.sendMessage(chatId, `📌 *${issue.text}*\n🕒 ${issue.createdAt}`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "🗑 O‘chirish", callback_data: `delete_${issueId}` }]],
      },
    });
  });
});

// 📌 4️⃣ O‘chirish tugmasi bosilganda muammolarni o‘chirish
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith("delete_")) {
    const issueId = data.split("_")[1];

    await db.collection("issues").doc(issueId).delete();
    bot.sendMessage(chatId, "✅ Muammo o‘chirildi.");
  } else if (data.startsWith("upvote_")) {
    const issueId = data.split("_")[1];
    const issueRef = db.collection("issues").doc(issueId);
    const issue = await issueRef.get();

    if (!issue.exists) return;

    const currentImportance = issue.data().importance || 0;
    await issueRef.update({ importance: currentImportance + 1 });

    bot.sendMessage(chatId, "✅ Muammo dolzarbligi oshirildi.");
  }
});

