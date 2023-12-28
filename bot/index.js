import TelegramBot from "node-telegram-bot-api";
import "../config/dotenv.js";
import { generate, checkMimeType } from "../api/gemini.js";
import { botToken, botCommandList } from "../constant/index.js";
import { fileToGenerativePart, savePhoto } from "../api/telegram.js";
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
          try {
            await this.bot.sendMessage(chatId, botCommandList);
          } catch (err) {
            BotResponseError.sendMessage(this.bot, chatId, err);
          } finally {
            disrequest();
          }
        });
      });

      this.bot.on("photo", (msg, meta) => {
        this.requestCallback(async (disrequest) => {
          const [chatId, username, text] = [msg.chat.id, msg.chat.username, msg.caption];
          try {
            const file = msg.photo[msg.photo.length - 1];
            const fileId = file.file_id;
            const fileUId = file.file_unique_id;
            const photo = await fileToGenerativePart(fileId);
            checkMimeType(photo.inlineData.data);
            await savePhoto(username, fileId, fileUId, "./upload/photo");
            const response = await generate(text, [photo]);
            await this.bot.sendMessage(chatId, response);
          } catch (err) {
            BotResponseError.sendMessage(this.bot, chatId, err);
            console.log(err)
          } finally {
            disrequest();
          }
        });
      });
  
      this.bot.onText(/^(.+)$/, (msg, match) => {
        this.requestCallback(async (disrequest) => {
          const [chatId, text] = [msg.chat.id, match[1] || ""];
          console.log(text);
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