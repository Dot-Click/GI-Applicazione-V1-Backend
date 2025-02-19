import express from "express";
import {
  createAdmin,
  loginAdmin,
  updatePassword,
  verifEmail,
} from "../controllers/auth.controller.js";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";

const router = express.Router();

router.post("/register-admin", createAdmin);
router.post("/login-admin", loginAdmin);

//forgot - password
router.post("/verify-email", verifEmail);
router.patch("/update-pass", updatePassword);

export default router;
