import express from "express";
import { signup, signin, logout,getProducts, searchByName, searchByCategory, getCategories, getMyProfile } from "../controllers/buyers.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.get("/logout", logout);

router.get("/me", isAuthenticated, getMyProfile);

router.get("/products", isAuthenticated, getProducts);

router.get("/products/searchByCategory", isAuthenticated, searchByCategory);

router.get("/products/searchByName", isAuthenticated, searchByName);

router.get("/products/getCategories", isAuthenticated, getCategories);

export default router;