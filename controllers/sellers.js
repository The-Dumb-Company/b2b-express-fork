import ErrorHandler from "../utils/error.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/features.js";
import pool from "../data/database.js"
import xss from "xss";
import validator from 'validator';

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

        // Check if Seller already exists
        const query = "SELECT * FROM sellers WHERE email = $1";
        const result  = await pool.query(query, [email]);

        if (result.rows.length !== 0) return next(new ErrorHandler("Buyer already exists", 400));

        // Hash password and insert Seller
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = "INSERT INTO sellers (name, email, password, business_name) VALUES ($1, $2, $3, $4) RETURNING *";
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

        // Check if Seller exists
        const query = "SELECT * FROM sellers WHERE email = $1";
        let checkUser = await pool.query(query, [sanitizedEmail]);   
        const user = checkUser.rows[0];

        if (!user) return next(new ErrorHandler("Seller does not exist", 400));

        // Verify passwrod
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

// Get seller details  
export const getMyProfile = (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });  
}  

// Add new product to the products table
export const addProduct = async (req, res, next) => {
    try {
        
        const { name, description, category, price, discount } = req.body;

        const seller_email = req.user.email;

        // Sanitize inputs
        const sanitizedName = xss(name.trim());
        const sanitizedDescription = xss(description.trim());
        const sanitizedCategory = xss(category.trim());
        const sanitizedPrice = parseFloat(price);
        const sanitizedDiscount = parseFloat(discount);

        // Validate inputs
        if (validator.isEmpty(sanitizedName) || 
            validator.isEmpty(sanitizedDescription) || 
            validator.isEmpty(sanitizedCategory) || 
            isNaN(sanitizedPrice) || 
            isNaN(sanitizedDiscount)) {
            return next(new ErrorHandler("Please fill all the fields correctly", 400));
        }

        if (sanitizedPrice <= 0 || sanitizedDiscount < 0) {
            return next(new ErrorHandler("Price must be greater than 0 and discount cannot be negative", 400));
        }

        // Insert product
        const insertProduct = "INSERT INTO products (name, description, category, price, discount, seller_email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
        const insertedProduct = await pool.query(insertProduct, [sanitizedName, sanitizedDescription, sanitizedCategory, sanitizedPrice, sanitizedDiscount, seller_email]);

        const product = insertedProduct.rows[0];
        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product
          });
    } catch (error) {
          next(error);
    }
}

  export const updateProduct = async (req, res, next) => {
    try {
        
        const { name, description, category, price, discount } = req.body;

        const productId = req.params.id;

        // Sanitize inputs
        const sanitizedName = xss(name.trim());
        const sanitizedDescription = xss(description.trim());
        const sanitizedCategory = xss(category.trim());
        const sanitizedPrice = parseFloat(price);
        const sanitizedDiscount = parseFloat(discount);

        // Validate inputs
        if (validator.isEmpty(sanitizedName) || 
            validator.isEmpty(sanitizedDescription) || 
            validator.isEmpty(sanitizedCategory) || 
            isNaN(sanitizedPrice) || 
            isNaN(sanitizedDiscount)) {
            return next(new ErrorHandler("Please fill all the fields correctly", 400));
        }

        if (sanitizedPrice <= 0 || sanitizedDiscount < 0) {
            return next(new ErrorHandler("Price must be greater than 0 and discount cannot be negative", 400));
        }

        // Check if product exists
        const query = "SELECT * FROM products WHERE product_id = $1";
        const getProduct = await pool.query(query, [productId]);

        let product = getProduct.rows[0];

        if (!product) {
            return next(new ErrorHandler("Invalid ID", 404));
        }

        // Update product
        const updateProduct = "UPDATE products SET name = $1, description = $2, category = $3, price = $4, discount = $5 WHERE product_id = $6 RETURNING *";
        const updatedProduct = await pool.query(updateProduct, [sanitizedName, sanitizedDescription, sanitizedCategory, sanitizedPrice, sanitizedDiscount, productId]);

        product = updatedProduct.rows[0];

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
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