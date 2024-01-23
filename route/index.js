import { Router } from "express";
import User from "../database/model/Users.js";

export const indexRoute = Router();

indexRoute.get("/", async (req, res) => {
  res.sendStatus(200);
});
