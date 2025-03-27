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

export const generateAndSaveToken = (user, res, isRemember) => {
  const token = sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: isRemember ? "7d" : "1hr",
    }
  );

  const refreshToken = sign(
    { id: user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "30d",
    }
  );

  const cookieSetting = {
    maxAge: isRemember ? 1000 * 60 * 60 * 24 * 7 : 60 * 60 * 1000,
    httpOnly: false,
    sameSite: "none",
    secure: true,
  };
  if (process.env.NODE_ENV === "production") {
    cookieSetting.secure = true;
    cookieSetting.httpOnly = true;
  }

  res.cookie('refreshToken', refreshToken, {...cookieSetting, maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
  
  res.cookie(`token`, `Bearer ${token}`, cookieSetting);
};

/**
 * used to format data in dd/mm/yyyy
 * @param {*} date which is an ISO date string
 * @returns
 */
function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}/${day}/${month}`;
}

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

export { cloudinaryConfig, cloudinaryUploader,formatDate };
