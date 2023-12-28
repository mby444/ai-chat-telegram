import fs from "fs";

export const getResponseText = (name) => {
    try {
        return fs.readFileSync(`./text-response/${name}.txt`, { encoding: "utf-8" });
    } catch (err) {
        return "[Gagal menampilkan respons teks]";
    }
};