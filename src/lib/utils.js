import "dotenv/config";
import jwt from "jsonwebtoken";
const { sign } = jwt;

/**
 * This function is used to generate a JWT token and then saved it into the cookies of incoming res
 * 
 * @param user it is the user object
 * @param res  incoming res object from express-Response Object
 */

export const generateAndSaveToken = (user, res) => {
  const token = sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
  res.cookie(`token`, `Bearer ${token}`, { httpOnly: false });
};
