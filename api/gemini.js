import "../config/dotenv.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

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