const TelegramBot = require("node-telegram-bot-api");
const { db, collection, addDoc, getDocs, doc, deleteDoc, query, orderBy } = require("./firebase");

// Telegram bot tokeni .env faylidan olinadi
const bot = new TelegramBot("7763969768:AAHGr47FyDCgA0NY3YZSwbBCHxETcgF8QTo", { polling: true });

// Markdown formatidagi maxsus belgilarni escapelash
const escapeMarkdown = (text) => {
  return text.replace(/([_*[\]()~>#+-=|{}.!])/g, "\\$1");
};

// /start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "🌍 Assalomu alaykum! Bu *Eco Tracker* bot. \n\n" +
    "♻ Siz ekologik muammolarni xabar bera olasiz. \n\n" +
    "➕ *Yangi muammo qo'shish:* /add \n" +
    "📋 *Barcha muammolar:* /issues", { parse_mode: "MarkdownV2" });
});

// 🌱 Yangi muammo qo‘shish
bot.onText(/\/add/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, escapeMarkdown("📌 Muammo nomini yozing:"), { parse_mode: "MarkdownV2" });

  bot.once("message", async (response) => {
    const issueTitle = response.text;
    bot.sendMessage(chatId, escapeMarkdown("📄 Muammo tavsifini yozing:"), { parse_mode: "MarkdownV2" });

    bot.once("message", async (descResponse) => {
      const issueDescription = descResponse.text;

      try {
        await addDoc(collection(db, "issues"), {
          username: msg.from.username || msg.from.first_name,
          title: issueTitle,
          description: issueDescription,
          createdAt: new Date()
        });

        bot.sendMessage(chatId, escapeMarkdown("✅ Muammo muvaffaqiyatli qo‘shildi!"), { parse_mode: "MarkdownV2" });
      } catch (error) {
        console.error("❌ Xatolik:", error);
        bot.sendMessage(chatId, escapeMarkdown("❌ Xatolik yuz berdi, qaytadan urinib ko‘ring."), { parse_mode: "MarkdownV2" });
      }
    });
  });
});

// 🔥 Muammo o‘chirish funksiyasi
async function deleteIssue(issueId) {
  try {
    await deleteDoc(doc(db, "issues", issueId));
    console.log(`Issue with ID ${issueId} deleted successfully`);
  } catch (error) {
    console.error("Error deleting issue:", error);
  }
}

// ❌ /delete_issue komandasi
bot.onText(/\/delete_issue (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const issueId = match[1]?.trim();

  if (!issueId) {
    return bot.sendMessage(chatId, "⚠ Muammo ID kiritilmadi.");
  }

  try {
    await deleteIssue(issueId);
    bot.sendMessage(chatId, `✅ Muammo muvaffaqiyatli o‘chirildi: *${escapeMarkdown(issueId)}*`, { parse_mode: "MarkdownV2" });
  } catch (error) {
    bot.sendMessage(chatId, "❌ Muammo o‘chirishda xatolik yuz berdi.");
  }
});

// 📊 Barcha muammolarni ko‘rish
bot.onText(/\/issues/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      bot.sendMessage(chatId, escapeMarkdown("❌ Hech qanday muammo topilmadi."), { parse_mode: "MarkdownV2" });
      return;
    }

    let issuesList = "📋 *Barcha muammolar:*\n\n";
    querySnapshot.forEach((doc) => {
      const issue = doc.data();
      issuesList += `📌 *${escapeMarkdown(issue.title)}* \n📝 ${escapeMarkdown(issue.description)} \n👤 ${escapeMarkdown(issue.username)} \n📅 ${new Date(issue.createdAt.toDate()).toLocaleString()}\n\n`;
    });

    bot.sendMessage(chatId, issuesList, { parse_mode: "MarkdownV2" });
  } catch (error) {
    console.error("❌ Xatolik:", error);
    bot.sendMessage(chatId, escapeMarkdown("❌ Xatolik yuz berdi, qaytadan urinib ko‘ring."), { parse_mode: "MarkdownV2" });
  }
});
