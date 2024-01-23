import fs from "fs";
import path from "path";
import "../config/dotenv.js";
import {
  botToken,
  mimeSignatures,
  reservedMdRegExp,
} from "../constant/index.js";

export const analizeMarkdown = (markdownString) => {
  const stack = [];
  const errorIndices = [];
  const mustEnclosedChars = ["*", "_", "`", "\"", "'"];
  const pushOrReplaceErrors = (charObj) => {
    const itemIndex = errorIndices.findIndex(
      (obj) => obj.char === charObj.char,
    );
    itemIndex === -1
      ? errorIndices.push(charObj)
      : (errorIndices[itemIndex] = charObj);
  };
  const deleteError = (char) => {
    const itemIndex = errorIndices.findIndex((obj) => obj.char === char);
    if (itemIndex !== -1) errorIndices.splice(itemIndex, 1);
  };
  for (let i = 0; i < markdownString.length; i++) {
    const char = markdownString[i];
    if (mustEnclosedChars.includes(char)) {
      if (stack.length === 0 || stack[stack.length - 1] !== char) {
        stack.push(char);
        pushOrReplaceErrors({ char, index: i });
      } else {
        stack.pop();
        deleteError(char);
      }
    }
  }
  const isValid = stack.length === 0;
  const output = { isValid, errorIndices };
  return output;
};

export const fixMarkdownFormat = (markdownString) => {
  const analized = analizeMarkdown(markdownString);
  const errorPositions = analized.errorIndices.map((obj) => obj.index);
  const splittedString = markdownString.split("");
  errorPositions.forEach((pos) => {
    splittedString[pos] = "";
  });
  const fixed = splittedString.join("");
  return fixed;
};

export const escapeMarkdown = (text, excludes = []) => {
  const escapedString = text
    .split("")
    .map((char) => {
      if (excludes.includes(char)) return char;
      return reservedMdRegExp.test(char) ? `\\${char}` : char;
    })
    .join("");
  return escapedString;
};

export const getPhotoPathById = async (fileId) => {
  const rawData = await fetch(
    `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`,
  );
  const data = await rawData.json();
  return data.result.file_path;
};

export const getPhotoBlobByPath = async (filePath) => {
  const rawData = await fetch(
    `https://api.telegram.org/file/bot${botToken}/${filePath}`,
  );
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

export const getPhotoCaption = (text = "") => {
  const defaultCaption = "Deskripsikan gambar ini menggunakan Bahasa Indonesia";
  const caption = !!text.trim() ? text : defaultCaption;
  return caption;
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
