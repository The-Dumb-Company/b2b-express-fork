import express from "express";
import { signup, signin, logout,getProducts, searchProducts, getCategories, getMyProfile } from "../controllers/buyers.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.get("/logout", logout);

routers.get("/me", isAuthenticated, getMyProfile);

router.get("/products", isAuthenticated, getProducts);

router.get("/products/search", isAuthenticated, searchProducts);

router.get("/products/getCategories", isAuthenticated, getCategories);

export default router;