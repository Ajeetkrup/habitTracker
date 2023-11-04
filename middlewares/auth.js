/**
 * Middleware function to verify JWT token.
 * If token is not found or invalid, redirects to login page.
 * Otherwise, sets the decoded token to req.user and proceeds to the next middleware.
 */

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const secretKey = process.env.TOKEN_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.cookies && req.cookies.jwt;
  if (!token) {
    return res.redirect("/user/login");
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
  } catch (err) {
    return res.redirect("/user/login");
  }
  next();
};

module.exports = verifyToken;
