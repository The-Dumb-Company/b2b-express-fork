import jsonwebtoken from "jsonwebtoken";

export const sendCookie = (user, res, message, statusCode = 200) => {
  // Generate token based on the user id
  const token = jsonwebtoken.sign({ _id: user.seller_id || user.buyer_id }, process.env.JWT_SECRET);

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,  // Token valid for 15 minutes
      sameSite: process.env.NODE_ENV === "dev" ? "lax" : "none",
      secure: process.env.NODE_ENV === "dev" ? false : true,
    })
    .json({
      success: true,
      message: message,
    });
};
