import "../config/dotenv.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiKey } from "../constant/index.js";

const genAI = new GoogleGenerativeAI(geminiKey);

const getPromptResult = async (prompt, images) => {
    const modelName = images ? "gemini-pro-vision" : "gemini-pro";
    const model = genAI.getGenerativeModel({ model: modelName });
    const contentParams = images ? [prompt, ...images] : prompt;
    const result = await model.generateContent(contentParams);
    return result;
};

export const generate = async (prompt, images) => {
    const isPromptEmpty = typeof prompt === "string" ? !prompt.trim() : true;
    if (isPromptEmpty) throw new Error("Prompt text can't be empty");
    const result = await getPromptResult(prompt, images);
    const response = result.response;
    const text = response.text();
    return text;
};