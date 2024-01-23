import TelegramBot from "node-telegram-bot-api";
import "../config/dotenv.js";
import { generate, checkMimeType, getChatHistory } from "../api/gemini.js";
import { botToken, botCommandList, botChatOpts } from "../constant/index.js";
import {
  fileToGenerativePart,
  savePhoto,
  getPhotoCaption,
  escapeMarkdown,
  fixMarkdownFormat,
} from "../api/telegram.js";
import { BotResponseError } from "../tool/error.js";
import { saveUserHistory } from "../database/tool/users.js";
import { moveHistory } from "../database/tool/cleared-histories.js";
import User from "../database/model/Users.js";
import ClearedHistory from "../database/model/ClearedHistories.js";

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
    this.bot.onText(/^((\/start|\/help))/, (msg, match) => {
      this.requestCallback(async (disrequest) => {
        const chatId = msg.chat.id;
        try {
          const formattedResponse = escapeMarkdown(
            fixMarkdownFormat(botCommandList),
            ["*", "`"],
          );
          await this.bot.sendMessage(chatId, formattedResponse, botChatOpts);
        } catch (err) {
          console.log("start", err);
          BotResponseError.sendMessage(this.bot, chatId, err);
        } finally {
          disrequest();
        }
      });
    });

    this.bot.onText(/^(\/random)/, (msg, match) => {
      this.requestCallback(async (disrequest) => {
        const chatId = msg.chat.id;
        const userData = { ...msg.from, ...msg.chat, date: msg.date };
        const text = "Jelaskan tentang topik apapun secara random";
        try {
          await this.bot.sendMessage(chatId, "Mengetik...");
          const oldUser = await User.findOne({ chatId }, { _id: 0 });
          const oldHistory = getChatHistory(oldUser?.history);
          const response = await generate(text, null, oldHistory);
          const formattedResponse = escapeMarkdown(
            fixMarkdownFormat(response),
            ["*", "`"],
          );
          await this.bot.sendMessage(chatId, formattedResponse, botChatOpts);
          await saveUserHistory(userData, text, response, oldUser);
        } catch (err) {
          await this.bot.sendMessage(
            chatId,
            "[Gagal menampilkan topik random]",
          );
        } finally {
          disrequest();
        }
      });
    });

    this.bot.onText(/^(\/clear)/, (msg, match) => {
      const chatId = msg.chat.id;
      const userData = { ...msg.from, ...msg.chat, date: msg.date };
      this.requestCallback(async (disrequest) => {
        try {
          await this.bot.sendMessage(chatId, "[Membersihkan history chat...]");
          const oldUser = await User.findOne({ chatId }, { _id: 0 });
          const oldHistory = oldUser?.history;
          const oldClearedHistory = await ClearedHistory.findOne({ chatId });
          await moveHistory(userData, oldHistory, oldClearedHistory);
          await this.bot.sendMessage(
            chatId,
            "[History chat berhasil dibersihkan, silahkan memulai topik baru]",
          );
        } catch (err) {
          await BotResponseError.sendMessage(this.bot, chatId, err, {
            defaultMessage: "[History gagal dibersihkan]",
          });
          console.log("/clear", err);
        } finally {
          disrequest();
        }
      });
    });

    this.bot.on("photo", (msg, meta) => {
      this.requestCallback(async (disrequest) => {
        const [chatId, username, text] = [
          msg.chat.id,
          msg.chat.username,
          msg.caption,
        ];
        const userData = { ...msg.from, ...msg.chat, date: msg.date };
        try {
          const file = msg.photo[msg.photo.length - 1];
          const fileId = file.file_id;
          const fileUId = file.file_unique_id;
          await this.bot.sendMessage(chatId, "Mengetik...");
          const caption = getPhotoCaption(text);
          const oldUser = await User.findOne({ chatId }, { _id: 0 });
          const photo = await fileToGenerativePart(fileId);
          checkMimeType(photo.inlineData.data);
          await savePhoto(username, fileId, fileUId, "./upload/photo");
          const response = await generate(caption, [photo]);
          const formattedResponse = escapeMarkdown(
            fixMarkdownFormat(response),
            ["*", "`"],
          );
          await this.bot.sendMessage(chatId, formattedResponse, botChatOpts);
          await saveUserHistory(userData, caption, response, oldUser);
        } catch (err) {
          BotResponseError.sendMessage(this.bot, chatId, err);
          console.log(48, err);
        } finally {
          disrequest();
        }
      });
    });

    this.bot.onText(/([\s\S]*)/m, (msg, match) => {
      this.requestCallback(async (disrequest) => {
        const [chatId, text] = [msg.chat.id, match[1] || ""];
        const userData = { ...msg.from, ...msg.chat, date: msg.date };
        try {
          await this.bot.sendMessage(chatId, "Mengetik...");
          const oldUser = await User.findOne({ chatId }, { _id: 0 });
          const oldHistory = getChatHistory(oldUser?.history);
          const response = await generate(text, null, oldHistory);
          const formattedResponse = escapeMarkdown(
            fixMarkdownFormat(response),
            ["*", "`"],
          );
          console.log(formattedResponse);
          await this.bot.sendMessage(chatId, formattedResponse, botChatOpts);
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
