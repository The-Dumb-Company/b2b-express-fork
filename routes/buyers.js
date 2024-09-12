import express from "express";
import { signup, signin, logout } from "../controllers/buyers.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.get("/logout", logout);

export default router;