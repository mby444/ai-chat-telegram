import "../config/dotenv.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiKey, allowedImageMime } from "../constant/index.js";
import { detectMimeType, getPhotoCaption } from "./telegram.js";
import { BotResponseError } from "../tool/error.js";

const genAI = new GoogleGenerativeAI(geminiKey);

export const getChatHistory = (history) => {
  const defaultHistory = [
    {
      role: "user",
      parts: "Gunakan bahasa indonesia",
    },
    {
      role: "model",
      parts: "Baiklah, saya akan menggunakan bahasa Indonesia.",
    },
  ];
  if (!history) return defaultHistory;
  const mappedHistory = history.map((h) => {
    return { role: h.role, parts: h.parts };
  });
  const mergedHistory = [...defaultHistory, ...mappedHistory];
  return mergedHistory;
};

export const getPromptResult = async (prompt, images, history) => {
  console.log("history", history);
  if (images) {
    const imagePrompt = getPhotoCaption(prompt);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const result = await model.generateContent([imagePrompt, ...images]);
    return result;
  }
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(prompt);
  return result;
};

export const generate = async (prompt, images, history) => {
  const result = await getPromptResult(prompt, images, history);
  const response = result.response;
  const text = response.text();
  return text;
};

export const checkMimeType = (base64Photo) => {
  const mimeType = detectMimeType(base64Photo);
  const isLegalMimeType = allowedImageMime.find((mime) => mime === mimeType);
  if (!isLegalMimeType)
    throw new BotResponseError("[mohon kirimkan format gambar yang sesuai]");
};
