import multer from "multer";

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, `${new Date().getTime()} - ${file.originalname}`);
  },
});

/**
 * Middleware for handling multiple file uploads using Multer.
 *
 * This middleware stores uploaded files in the `./upload` directory
 * and names them using the current timestamp followed by the original filename.
 *
 * @module uploadMiddleware
 */
const upload = multer({
  storage,
  limits: {
    fileSize: 12 * 1024 * 1024, // 12MB in bytes
  },
}).fields([
  { name: "contract", maxCount: 1 },
  { name: "permission_to_build", maxCount: 1 },
  { name: "psc", maxCount: 1 },
  { name: "pos", maxCount: 1 },
]);

const singleUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 12MB in bytes
  },
})
export {upload, singleUpload};
