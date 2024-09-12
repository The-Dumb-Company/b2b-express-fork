import jwt from "jsonwebtoken";
import pool from "../data/database.js"; 

export const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(404).json({ success: false, message: "Sign In First" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Query to find the user either in the 'buyers' or 'sellers' table
    const buyerQuery = "SELECT * FROM buyers WHERE buyer_id = $1";
    const sellerQuery = "SELECT * FROM sellers WHERE seller_id = $1";

    // Try to find the user in buyers table
    let user = await pool.query(buyerQuery, [decoded._id]);

    // If not found in buyers, try finding in sellers
    if (user.rows.length === 0) {
      user = await pool.query(sellerQuery, [decoded._id]);
      if (user.rows.length === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
    }

    // Attach user data to req.user
    req.user = user.rows[0];

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};