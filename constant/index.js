import { getResponseText } from "../tool/response-text.js";

export const botToken = process.env.BOT_TOKEN;
export const geminiKey = process.env.GEMINI_API_KEY;
export const botCommandList = getResponseText("command");
export const mimeSignatures = {
  JVBERi0: "application/pdf",
  R0lGODdh: "image/gif",
  R0lGODlh: "image/gif",
  iVBORw0KGgo: "image/png",
  "/9j/": "image/jpeg",
};
export const allowedImageMime = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
];
export const botChatOpts = { parse_mode: "MarkdownV2" };
export const reservedMdRegExp = /([^a-zA-Z0-9 ])/;
