import multer from "multer";

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    const newName = `${new Date.now()} - ${originalName}`;
    file.cleanedOriginalName = originalName;
    cb(null, `${newName}`);
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
const upload = (req, res, next) => {
  multer({
    storage,
    limits: {
      fileSize: 12 * 1024 * 1024,
    },
  }).fields([
    { name: "contract", maxCount: 1 },
    { name: "permission_to_build", maxCount: 1 },
    { name: "psc", maxCount: 1 },
    { name: "pos", maxCount: 1 },
    { name: "add_additional_1", maxCount: 1 },
    { name: "add_additional_2", maxCount: 1 },
    { name: "add_additional_3", maxCount: 1 },
    { name: "add_additional_4", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

/**
 * Middleware for handling single file uploads using Multer.
 *
 * This middleware stores uploaded files fetched by specific key in the `./upload` directory
 * and names them using the current timestamp followed by the original filename.
 *
 * @module uploadMiddleware
 */
const singleUpload = (fieldName) => (req, res, next) => {
  multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      cb(null, true);
    },
  }).single(fieldName)(req, res, (err) => {
    if (err) {
     return res.status(400).json({ message: err.message });
    }
    next();
  });
};

export {upload, singleUpload};
