import { connectDB } from "./database/connection.js";
import { Bot } from "./bot/index.js";

connectDB();
const bot = new Bot();
bot.init();
bot.start();
console.log("Bot is running...");