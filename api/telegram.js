import "../config/dotenv.js";
import { botToken } from "../constant/index.js";

export const getPhotoPathById = async (fileId) => {
    const rawData = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    const data = await rawData.json();
    return data.result.file_path;
};

export const getPhotoBlobByPath = async (filePath) => {
    const rawData = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
    const data = await rawData.blob();
    return data;
};

export const getBase64PhotoById = async (fileId) => {
    const filePath = await getPhotoPathById(fileId);
    const fileBlob = await getPhotoBlobByPath(filePath);
    const base64Photo = fileBlob.toString("base64");
    return base64Photo;
};