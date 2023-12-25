import TelegramBot from "node-telegram-bot-api";
import "../config/dotenv.js";
import { generate } from "../api/gemini.js";

export class Bot {
    constructor() {
      this.isBreak = false;
      this.isStopped = false;
      this.token = process.env.BOT_TOKEN;
      this.bot = null;
    }

    init() {
        this.bot = new TelegramBot(this.token, { polling: true });
    }
  
    start() {
      this.bot.onText(/^((\/start|\/help))$/, (msg, match) => {
        this.requestCallback(async (disrequest) => {
          const chatId = msg.chat.id;
        //   const response = await getReply(match[0]);
          await this.bot.sendMessage(chatId, "Test");
          disrequest();
        });
      });

    //   this.bot.on("photo", (msg, meta) => {
    //     this.requestCallback(async (disrequest) => {
    //         const chatId = msg.chat.id;
    //         console.log(msg);
    //         console.dir(meta);
    //         await this.bot.sendPhoto(chatId, )
    //         disrequest();
    //     });
    //   });
  
      this.bot.onText(/^(.+)$/, (msg, match) => {
        this.requestCallback(async (disrequest) => {
          const [chatId, text] = [msg.chat.id, match[1] || ""];
          await this.bot.sendMessage(chatId, "Wait...");
          const response = await generate(text);
          await this.bot.sendMessage(chatId, response);
          disrequest();
        });
      });
    }
  
    requestCallback(callback = Function()) {
      if (this.isStopped) {
        return;
      }
      if (this.isBreak) {
        this.isBreak = false;
        return;
      }
      this.isBreak = true;
      callback(() => {
        this.isBreak = false;
      });
    }
}