import ErrorHandler from "../utils/error.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/features.js";
import pool from "../data/database.js"
import xss from "xss";
import validator from "validator";

pool.connect();

export const signup = async (req, res, next) => {
    try {
        const {name, business_name, email, password} = req.body;

        //Sanitize and Validate Input
        const sanitizedEmail = xss(email.trim());
        const sanitizedName = xss(name.trim());
        const sanitizedBusinessName = xss(business_name.trim());

        if (!validator.isEmail(sanitizedEmail)) {
            return next(new ErrorHandler("Invalid email address", 400));
        }

        if (validator.isEmpty(sanitizedName) || validator.isEmpty(sanitizedBusinessName) || validator.isEmpty(password)) {
            return next(new ErrorHandler("All fields are required", 400));
        }

        if (!validator.isLength(password, { min: 6 })) {
            return next(new ErrorHandler("Password must be at least 6 characters long", 400));
        }

        //Check if Buyer already exists
        const query = "SELECT * FROM buyers WHERE email = $1";
        const result  = await pool.query(query, [sanitizedEmail]);

        if (result.rows.length !== 0) return next(new ErrorHandler("Buyer already exists", 400));

        // Hash password and insert the Buyer
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = "INSERT INTO buyers (name, email, password, business_name) VALUES ($1, $2, $3, $4) RETURNING *";
        const insertedUser = await pool.query(insertQuery, [sanitizedName, sanitizedEmail, hashedPassword, sanitizedBusinessName]);

        const user = insertedUser.rows[0];

        sendCookie(user, res, "Signed Up Successfully", 201);

    } catch (error) {
        next(error);
  }
}

export const signin = async (req, res, next) => {
    try{
        const {email, password} = req.body;

        // Sanitize and validate input
        const sanitizedEmail = xss(email.trim());
        const sanitizedPassword = xss(password.trim());

        if (!validator.isEmail(sanitizedEmail)) {
            return next(new ErrorHandler("Invalid email address", 400));
        }

        if (validator.isEmpty(sanitizedPassword)) {
            return next(new ErrorHandler("Password is required", 400));
        }

        // Check if Buyer exists
        const query = "SELECT * FROM buyers WHERE email = $1";
        let checkUser = await pool.query(query, [sanitizedEmail]);   
        const user = checkUser.rows[0];

        if (!user) return next(new ErrorHandler("Buyer does not exist", 400));

        // Verify password
        const isMatch = await bcrypt.compare(sanitizedPassword, user.password);

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

// Get Buyer details
export const getMyProfile = (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });  
} 

// Get all products
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

// Search for products based on category
export const searchByCategory = async (req, res, next) => {
    try {
        const { category } = req.query;

        if (!category) {
            return res.status(400).json({ success: false, message: "Please provide a search term." });
        }

        const query = "SELECT * FROM products WHERE category = $1";      

        // Execute the query
        const result = await pool.query(query, [category]);

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
        next(error);  
    }
};

// Search for products based on name likeness
export const searchByName= async (req, res, next) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ success: false, message: "Please provide a search term." });
        }

        const query = "SELECT * FROM products WHERE name ILIKE $1";
        const values = [`%${name}%`];      

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
        next(error);  
    }
};

// Get all the distinct categories of products present
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