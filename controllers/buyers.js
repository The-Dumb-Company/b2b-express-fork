import ErrorHandler from "../utils/error.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/features.js";
import pool from "../data/database.js"

pool.connect();

export const signup = async (req, res, next) => {
    try {
        const {name, business_name, email, password} = req.body;

        const query = "SELECT * FROM buyers WHERE email = $1";
        const result  = await pool.query(query, [email]);

        if (result.rows.length !== 0) return next(new ErrorHandler("Buyer already exists", 400));

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = "INSERT INTO buyers (name, email, password, business_name) VALUES ($1, $2, $3, $4) RETURNING *";
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

        const query = "SELECT * FROM buyers WHERE email = $1";
        let checkUser = await pool.query(query, [email]);   
        const user = checkUser.rows[0];

        if (!user) return next(new ErrorHandler("Buyer does not exist", 400));

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

export const getMyProfile = (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });  
} 

export const getProducts = async (req, res, next) => {
    try{
        const query = "SELECT * FROM products";
        const gettingProducts = await pool.query(query);
        const products = gettingProducts.rows;
        
        if (!products) {
          return next(new ErrorHandler("No products found", 404));
        }
  
        res.status(200).json({
          success: true,
          products
        })
    } catch(error) {
        next(error);
    }
  }
  
  export const searchProducts = async (req, res, next) => {
    try {
        const { category, product_name } = req.query;

        // Basic validation: at least one search parameter should be provided
        if (!category && !product_name) {
            return res.status(400).json({ success: false, message: "Please provide a search term (category or product_name)." });
        }

        let query = "";
        const values = [];

        // if (category && product_name) {
        //   query += "SELECT * FROM products WHERE category = $1 AND name ILIKE $2";
        //   values.push(category);
        //   values.push(`%{product_name}%`);
        // }
        if (category) {
            query += "SELECT * FROM products WHERE category = $1";
            values.push(category);
        }
        else if (product_name) {
            query += "SELECT * FROM products WHERE name ILIKE $1";
            values.push(`%{product_name}%`);      
        }

        // Execute the query
        const result = await pool.query(query, values);

        // Check if any products are found
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No products found." });
        }

        // Return the found products
        res.status(200).json({
            success: true,
            products: result.rows,
        });
    } catch (error) {
        next(error);  // Pass error to the error handling middleware
    }
};

export const getCategories = async (req, res, next) => {
  try {
      const query = "SELECT DISTINCT category FROM products ORDER BY category ASC";
      const result = await pool.query(query);

      if (result.rows.length === 0) {
          return res.status(404).json({ success: false, message: "No categories found" });
      }

      const categories = result.rows;

      res.status(200).json({
          success: true,
          categories,
      });
  } catch (error) {
      next(error);
  }
};