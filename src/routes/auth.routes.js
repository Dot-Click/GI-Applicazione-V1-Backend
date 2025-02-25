import express from "express";
import {
  createAdmin,
  getAdminInfo,
  loginAdmin,
  updatePassword,
  verifEmail,
} from "../controllers/auth.controller.js";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";

const router = express.Router();

router.post("/register-admin", createAdmin);
router.post("/login-admin", loginAdmin);
router.get("/getAdmin",Auth, checkRole(["ADMIN"]), getAdminInfo)

//forgot - password
router.post("/verify-email", verifEmail);
router.patch("/update-pass", updatePassword);

export default router;
