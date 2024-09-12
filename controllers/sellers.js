import ErrorHandler from "../utils/error.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/features.js";
import pool from "../data/database.js"

pool.connect();

export const signup = async (req, res, next) => {
    try {
        const {name, business_name, email, password} = req.body;

        const query = "SELECT * FROM sellers WHERE email = $1";
        const result  = await pool.query(query, [email]);

        if (result.rows.length !== 0) return next(new ErrorHandler("Buyer already exists", 400));

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = "INSERT INTO sellers (name, email, password, business_name) VALUES ($1, $2, $3, $4) RETURNING *";
        const insertedUser = await pool.query(insertQuery, [name, email, hashedPassword, business_name]);

        const user = insertedUser.rows[0];

        sendCookie(user, res, "Signed Up Successfully", 201);

    } catch (error) {
        next(error);
    }
}

export const signin = async (req, res, next) => {
    try{
        const {email, password} = req.body;

        const query = "SELECT * FROM sellers WHERE email = $1";
        let checkUser = await pool.query(query, [email]);   
        const user = checkUser.rows[0];

        if (!user) return next(new ErrorHandler("Seller does not exist", 400));

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return next(new ErrorHandler("Invalid Email or Password", 400));
        }

        sendCookie(user, res, "Signed In Successfully", 201);
   } catch(error) {
        next(error);
   }
}


export const logout = (req, res) => {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        sameSite: process.env.NODE_ENV === "dev" ? "lax" : "none",
        secure: process.env.NODE_ENV === "dev" ? false : true,
      })
      .json({
        success: true,
        user: req.user,
      });
  };

  export const addProduct = async (req, res, next) => {
    try {
        
        const { productName, productDesc, category, price, discount } = req.body;

        const seller_email = req.user.email;

        if (!productName || !productDesc || !price || !discount || !category) {
            return next(new ErrorHandler("Please fill all the fields", 400));
        }

        const insertProduct = "INSERT INTO products (name, description, category, price, discount, seller_email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
        const insertedProduct = await pool.query(insertProduct, [productName, productDesc, category, price, discount, seller_email]);

        const product = insertedProduct.rows[0];
        res.status(201).json({
            success: true,
            message: "Product added successfully",
          });
    } catch (error) {
          next(error);
    }
  }

  export const updateProduct = async (req, res, next) => {
    try {
        
        const { productName, productDesc, category, price, discount } = req.body;

        const productId = req.params.id;

        if (!productName || !productDesc || !price || !discount || !category) {
            return next(new ErrorHandler("Please fill all the fields", 400));
        }

        const query = "SELECT * FROM products WHERE product_id = $1";
        const getProduct = await pool.query(query, [productId]);

        let product = getProduct.rows[0];

        if (!product) {
            return next(new ErrorHandler("Invalid ID", 404));
        }

        const updateProduct = "UPDATE products SET name = $1, description = $2, category = $3, price = $4, discount = $5 WHERE product_id = $6"
        const updatedProduct = await pool.query(updateProduct, [productName, productDesc, category, price, discount, productId]);

        product = updatedProduct.rows[0];

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
          });
    } catch (error) {
          next(error);
    }
  }

export const deleteProduct = async (req, res, next)  => {
    try {
        const productId = req.params.id;

        const query = "SELECT * FROM products WHERE product_id = $1";
        const getProduct = await pool.query(query, [productId]);

        let product = getProduct.rows[0];

        if (!product) {
            return next(new ErrorHandler("Invalid ID", 404));
        }

        const deleteProduct = "DELETE FROM products WHERE product_id = $1"
        const deletedProduct = await pool.query(deleteProduct, [productId]);

        product = deletedProduct.rows[0];

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            product
          });
    } catch (error) {
          next(error);
    }  
}

export const getMyProducts = async (req, res, next) => {
    try {
        const seller_email = req.user.email;

        const getProduct = "SELECT * FROM products WHERE seller_email = $1";
        const gettingProducts = await pool.query(getProduct, [seller_email]);
        const products = gettingProducts.rows;

        if (!products) {
            return next(new ErrorHandler("You have no products", 400));
        }

        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        next(error);
    }

}