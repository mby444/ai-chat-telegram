import express from "express";
import "../config/dotenv.js";

export const app = express();
const port = process.env.PORT;

app.get("/", (req, res) => {
    res.sendStatus(200);
});

app.all("*", (req, res) => {
    res.sendStatus(404);
});

app.listen(port, () => {
    console.log(`Server running at port ${port}...`);
});