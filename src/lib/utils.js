import "dotenv/config";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
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

  let cookieSetting = {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "none",
    secure: false,
  };
  console.log("process.env.NODE_ENV ", process.env.NODE_ENV);
  if (process.env.NODE_ENV === "production") {
    cookieSetting.secure = true;
    cookieSetting.httpOnly = true;
  }

  res.cookie(`token`, `Bearer ${token}`, cookieSetting);
};

/**
 * used to format data in dd/mm/yyyy
 * @param {*} date which is an ISO date string
 * @returns
 */
export const formatDate = (date) => {
  return date.toLocaleDateString("en-GB").replace(/\//g, "/");
};

/**
 * cloudinary configuration function and uploader
 * @returns cloudinary configuration object and cloudinary uploader
 */
const cloudinaryConfig = () =>
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

const cloudinaryUploader = async (filePath) => {
  try {
    if (!filePath) return;
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    return result;
  } catch (error) {
    console.log("Cloudinary Upload Error:", error);
  }
};

export { cloudinaryConfig, cloudinaryUploader };
