import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate users using JWT.
 *
 * This function extracts the JWT token from cookies, verifies it,
 * and attaches the decoded user information to `req.user`.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 *
 * @returns {Promise<void>} Sends a response if authentication fails, otherwise calls `next()`.
 */


export const Auth = async (req, res, next) => {
  try {
    const token = req.cookies.token?.split(" ");
    if (!token || token[0] !== `Bearer`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const decoded = jwt.verify(token[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};
