import express from "express";
import {
  createAdmin,
  getAllUsers,
  login,
  loginAdmin,
  logout,
  signup,
  updatePassword,
  verifEmail,
} from "../controllers/auth.controller.js";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";

const router = express.Router();

// client/user - authentication routes
router.post("/create-client", Auth, checkRole(["ADMIN"]), signup);
router.post("/login-client", checkRole(["USER"]), login);
router.post("/logout-client", Auth, checkRole(["USER"]), logout); //optional

// admin - authentication routes
router.get("/users", Auth, checkRole(["ADMIN"]), getAllUsers);
router.post("/register-admin", createAdmin);

/**
 * @swagger
 * /api/auth/login-admin:
 *   post:
 *     summary: Admin login
 *     description: Logs in an admin user and returns an authentication token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin17@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "admin123417"
 *     responses:
 *       200:
 *         description: Admin logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "logged in Successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: b9fc47c2-8f4e-4b3d-9eff-cd5f444b3bff
 *                     name:
 *                       type: string
 *                       example: admin1244
 *                     email:
 *                       type: string
 *                       example: "admin@example.com"
 *                     password:
 *                        type: string
 *                        example: $2b$10$kZkkGYV/WOW6F.Gkq8lMcOp1ImuvGH7GSFTLCHDsrsyS2eMiDdK3a
 *                     role:
 *                        type: string
 *                        example: ADMIN
 *                     createdAt:
 *                        type: string
 *                        example: 2025-02-13 18:41:47.357
 *                     updatedAt:
 *                         type: string
 *                         example: 2025-02-13 18:41:47.357
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:
 *                     - "L’indirizzo email inserito non è associato a GI Costruzioni"
 *                     - "La password non è corretta. Riprova o reimposta la tua password se l'hai dimenticata"
 *       401:
 *         description: Missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tutti i campi sono obbligatori"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.post("/login-admin", loginAdmin);

//forgot - password

/** 
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify if an email exists
 *     description: Checks if an email exists in the database and generates a verification token if found.
 *     tags:
 *       - Verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin32@gmail.com"
 *     responses:
 *       200:
 *         description: Email found successfully, verification token set in cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ti abbiamo inviato un’e-mail per consentirti di reimpostare la password"
 *                 status:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Email not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "L’indirizzo email inserito non è associato a GI Costruzioni"
 *                 status:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Missing email in the request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "L'e-mail è obbligatoria!"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.post("/verify-email", verifEmail);

/**
 * @swagger
 * /api/auth/update-password:
 *   patch:
 *     summary: Update admin password
 *     description: Updates the password for a user based on a valid verification token.
 *     tags:
 *       - Verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token received during email verification.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: The new password to set.
 *                 example: "NewSecurePass123!"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "password updated successfully"
 *                 status:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Missing or invalid token / Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verification Expired" 
 *                 status:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing Required Fields"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.patch("/update-pass", updatePassword);

export default router;
