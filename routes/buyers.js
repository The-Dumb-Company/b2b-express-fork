import express from "express";
import { signup, signin, logout,getProducts, searchProducts, getCategories } from "../controllers/buyers.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.get("/logout", logout);

router.get("/products", isAuthenticated, getProducts);

router.get("/products/search", isAuthenticated, searchProducts);

router.get("/products/getCategories", isAuthenticated, getCategories);

export default router;