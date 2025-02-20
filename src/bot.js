const TelegramBot = require("node-telegram-bot-api");
const { db, collection, addDoc, getDocs, query, orderBy, where, doc, setDoc, updateDoc } = require("./firebase");

const TOKEN = "7562256824:AAGsBS3mHczBDUsu_1edvboEzahKid40GoU";
const bot = new TelegramBot(TOKEN, { polling: true });

// ✅ Foydalanuvchini ro‘yxatdan o‘tkazish
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username || "NoUsername";
  const fullName = msg.chat.first_name + (msg.chat.last_name ? " " + msg.chat.last_name : "");

  // Firestore-da foydalanuvchini tekshirish
  const userRef = doc(db, "users", chatId.toString());
  await setDoc(userRef, { telegram_id: chatId, username, full_name }, { merge: true });

  bot.sendMessage(chatId, `👋 Salom, ${fullName}! Siz muvaffaqiyatli ro‘yxatdan o‘tdingiz.`);
});

// ✅ Muammo qo‘shish
bot.onText(/\/add_issue (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const issueText = match[1];

  if (!issueText) {
    return bot.sendMessage(chatId, "⚠️ Muammo matnini kiriting: `/add_issue Muammo matni`");
  }

  const issueRef = collection(db, "issues");
  await addDoc(issueRef, {
    title: issueText,
    description: "Tavsif kiritilmagan",
    category: "Umumiy",
    location: "Noma’lum",
    created_at: new Date(),
    votes: 0,
  });

  bot.sendMessage(chatId, "✅ Muammo muvaffaqiyatli qo‘shildi!");
});

// ✅ Muammolarni dolzarblik bo‘yicha saralash
bot.onText(/\/issues/, async (msg) => {
  const chatId = msg.chat.id;
  
  const issuesRef = collection(db, "issues");
  const q = query(issuesRef, orderBy("votes", "desc")); // ✅ Ovozlarga qarab tartiblash
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return bot.sendMessage(chatId, "🚫 Hozircha hech qanday muammo yo‘q.");
  }

  let message = "📌 **Muammolar:**\n";
  querySnapshot.forEach((doc) => {
    const issue = doc.data();
    message += `\n📍 *${issue.title}* - 🔥 ${issue.votes} ovoz\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});

// ✅ Muammo uchun ovoz berish (dolzarblikni oshirish)
bot.onText(/\/vote (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const issueTitle = match[1];

  const issuesRef = collection(db, "issues");
  const q = query(issuesRef, where("title", "==", issueTitle));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return bot.sendMessage(chatId, "⚠️ Bunday nomli muammo topilmadi.");
  }

  querySnapshot.forEach(async (docSnap) => {
    const issueRef = doc(db, "issues", docSnap.id);
    const issueData = docSnap.data();
    await updateDoc(issueRef, { votes: issueData.votes + 1 });

    bot.sendMessage(chatId, `👍 "${issueData.title}" uchun ovoz berdingiz!`);
  });
});
