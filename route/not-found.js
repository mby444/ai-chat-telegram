import { Router } from "express";

export const notFoundRoute = Router();

notFoundRoute.all("*", (req, res) => {
    res.render("not-found");
});