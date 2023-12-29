import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import "../config/dotenv.js";
import { botToken, mimeSignatures } from "../constant/index.js";

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

export const getBufferPhotoById = async (fileId) => {
  const filePath = await getPhotoPathById(fileId);
  const fileBlob = await getPhotoBlobByPath(filePath);
  const arrayBuffer = await fileBlob.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  return fileBuffer;
};

export const getBase64PhotoById = async (fileId) => {
    const fileBuffer = await getBufferPhotoById(fileId);
    const base64Photo = fileBuffer.toString("base64");
    return base64Photo;
};

  
export const detectMimeType = (b64) => {
  for (let s in mimeSignatures) {
    if (b64.indexOf(s) === 0) return mimeSignatures[s];
  }
};

export const fileToGenerativePart = async (fileId) => {
  const base64Photo = await getBase64PhotoById(fileId);
  const mimeType = detectMimeType(base64Photo);
  return {
      inlineData: {
          data: base64Photo,
          mimeType,
      },
  };
};

export const savePhoto = async (username, fileId, fileUId, directory) => {
  const fileBuffer = await getBufferPhotoById(fileId);
  const fileExtension = `.${detectMimeType(fileBuffer.toString("base64")).split("/")[1]}`;
  const fileName = `${username}_${fileUId}_${Date.now()}${fileExtension}`;
  const fullPath = path.join(directory, fileName);
  const isDirExists = fs.existsSync(directory);
  if (!isDirExists) fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(fullPath, fileBuffer);
};