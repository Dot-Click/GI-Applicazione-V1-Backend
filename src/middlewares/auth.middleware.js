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
    const token = req.cookies?.token?.split(" ");
    const refreshToken = req.cookies?.refreshToken;

    if (!token || token[0] !== "Bearer" || !token[1]) { // checks if the access token is available in cookies
      if (!refreshToken) {                              // then checks for refreshToken if its also unavailable means user is completely unauthorized
        return res.status(401).json({ error: "Unauthorized" });
      }

      return jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
        (refreshErr, refreshDecoded) => {
          if (refreshErr) {
            return res
              .status(403)
              .json({ error: "Invalid or expired refresh token" });
          }
          const newAccessToken = jwt.sign(
            { id: refreshDecoded.id, role: refreshDecoded.role },
            process.env.JWT_SECRET,
            { expiresIn: "3h" }
          );
          res.cookie("token", `Bearer ${newAccessToken}`, {
            maxAge: 3 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "none",
            secure: true,
          });
          req.user = { id: refreshDecoded.id, role: refreshDecoded.role }
          next();
        }
      );
    }

    // if both tokens are in the cookies
    jwt.verify(token[1], process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.message === "jwt expired") {  // if current access token expired
          if (!refreshToken) {
            return res.status(401).json({ error: "No refresh token provided" });
          }

          return jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET,
            (refreshErr, refreshDecoded) => {
              if (refreshErr) {
                return res
                  .status(403)
                  .json({ error: "Invalid or expired refresh token" });
              }

              const newAccessToken = jwt.sign( 
                { id: refreshDecoded.id, role: 'ADMIN' },
                process.env.JWT_SECRET,
                { expiresIn: "3h" }
              );
              
              res.cookie("token", `Bearer ${newAccessToken}`, {
                maxAge: 3 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "none",
                secure: process.env.NODE_ENV === "production",
              });
              console.log("access token refreshed-after expiration");
              next();
            }
          );
        } else {
          return res.status(403).json({ error: `Invalid token: ${err.message}` });
        }
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
