import { Router } from "express";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";
import { createAccountWithSupplier, deleteAccounts, getAccountWithOrder, getAccountWithSupplierById, getAllAccountWithSuppliers, updateAccountWithSupplier } from "../controllers/accounts.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router()

router.post("/create",Auth, checkRole(["ADMIN"]),upload, createAccountWithSupplier)
router.get("/supplier", Auth, checkRole(["ADMIN"]), getAllAccountWithSuppliers)
router.get("/order", Auth, checkRole(["ADMIN"]), getAccountWithOrder)
router.get("/:id",Auth, checkRole(["ADMIN"]), getAccountWithSupplierById)
router.patch("/update/:id", Auth, checkRole(["ADMIN"]),upload, updateAccountWithSupplier)
router.delete("/delete",Auth, checkRole(["ADMIN"]), deleteAccounts)

export default router