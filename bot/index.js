import TelegramBot from "node-telegram-bot-api";
import "../config/dotenv.js";
import { generate } from "../api/gemini.js";
import { botToken } from "../constant/index.js";
import { getBase64PhotoById } from "../api/telegram.js";
import { BotResponseError } from "../tool/error.js";

export class Bot {
    constructor() {
      this.isBreak = false;
      this.isStopped = false;
      this.token = botToken;
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

      this.bot.on("photo", (msg, meta) => {
        this.requestCallback(async (disrequest) => {
          const chatId = msg.chat.id;
          try {
            if (meta.type !== "photo") throw new BotResponseError("[Please send valid photo file format]");
            const fileId = msg.photo[msg.photo.length - 1].file_id;
          } catch (err) {
            BotResponseError.sendMessage(this.bot, chatId, err);
          } finally {
            disrequest();
          }
        });
      });
  
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