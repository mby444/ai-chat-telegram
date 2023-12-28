import "../config/dotenv.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiKey, allowedImageMime } from "../constant/index.js";
import { detectMimeType } from "./telegram.js";
import { BotResponseError } from "../tool/error.js";

const genAI = new GoogleGenerativeAI(geminiKey);

const getPromptResult = async (prompt, images) => {
    const modelName = images ? "gemini-pro-vision" : "gemini-pro";
    const model = genAI.getGenerativeModel({ model: modelName });
    const contentParams = images ? [prompt, ...images] : prompt;
    console.log(contentParams)
    const result = await model.generateContent(contentParams);
    return result;
};

export const generate = async (prompt, images) => {
    const defaultPrompt = "Deskripsikan gambar ini menggunakan Bahasa Indonesia";
    const isPromptEmpty = typeof prompt === "string" ? !prompt.trim() : true;
    const finalPrompt = isPromptEmpty ? defaultPrompt : prompt;
    const result = await getPromptResult(finalPrompt, images);
    const response = result.response;
    const text = response.text();
    return text;
};

export const checkMimeType = (base64Photo) => {
    const mimeType = detectMimeType(base64Photo);
    const isLegalMimeType = allowedImageMime.find((mime) => mime === mimeType);
    if (!isLegalMimeType) throw new BotResponseError("[mohon kirimkan format gambar yang sesuai]");
};