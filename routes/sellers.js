import express from "express";
import { signup, signin, logout, addProduct, deleteProduct, getMyProducts, updateProduct } from "../controllers/sellers.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.get("/logout", logout);

router.post("/addProduct", isAuthenticated, addProduct);

router.get("/getMyProducts", isAuthenticated, getMyProducts);

router.route("/:id", isAuthenticated).put(updateProduct).delete(deleteProduct);

export default router;