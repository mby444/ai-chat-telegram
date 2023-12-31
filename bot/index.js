import TelegramBot from "node-telegram-bot-api";
import "../config/dotenv.js";
import { generate, checkMimeType, getChatHistory } from "../api/gemini.js";
import { botToken, botCommandList } from "../constant/index.js";
import { fileToGenerativePart, savePhoto } from "../api/telegram.js";
import { BotResponseError } from "../tool/error.js";
import { saveUserHistory } from "../database/tool/users.js";
import User from "../database/model/Users.js";

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
          const userData = { ...msg.from, ...msg.chat };
          try {
            const file = msg.photo[msg.photo.length - 1];
            const fileId = file.file_id;
            const fileUId = file.file_unique_id;
            await this.bot.sendMessage(chatId, "Mengetik...");
            const oldUser = await User.findOne({ chatId }, { "_id": 0 });
            const photo = await fileToGenerativePart(fileId);
            checkMimeType(photo.inlineData.data);
            await savePhoto(username, fileId, fileUId, "./upload/photo");
            const response = await generate(text, [photo], );
            await this.bot.sendMessage(chatId, response);
            await saveUserHistory(userData, text, response, oldUser);
          } catch (err) {
            BotResponseError.sendMessage(this.bot, chatId, err);
            console.log(48, err)
          } finally {
            disrequest();
          }
        });
      });
  
      this.bot.onText(/^(.+)$/, (msg, match) => {
        this.requestCallback(async (disrequest) => {
          const [chatId, text] = [msg.chat.id, match[1] || ""];
          const userData = { ...msg.from, ...msg.chat };
          try {
            await this.bot.sendMessage(chatId, "Mengetik...");
            const oldUser = await User.findOne({ chatId }, { "_id": 0 });
            const oldHistory = getChatHistory(oldUser?.history);
            const response = await generate(text, null, oldHistory);
            await this.bot.sendMessage(chatId, response);
            await saveUserHistory(userData, text, response, oldUser);
          } catch (err) {
            BotResponseError.sendMessage(this.bot, chatId, err);
            console.log("onText err", err);
          } finally {
            disrequest();
          }
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