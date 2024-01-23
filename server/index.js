import express from "express";
import "../config/dotenv.js";
import { indexRoute } from "../route/index.js";
import { notFoundRoute } from "../route/not-found.js";

export const app = express();
const port = process.env.PORT;

app.use(express.static("./public"));
app.get("/", indexRoute);
app.all("*", notFoundRoute);

app.listen(port, () => {
  console.log(`Server running at port ${port}...`);
});
