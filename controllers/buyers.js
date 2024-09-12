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