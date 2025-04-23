import { Router } from "express";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";
import { createAccountWithSupplier, deleteAccounts, fileUploadOfSalAttach, generatePDF, getAccountWithOrder, getAccountWithSupplierById, getAllAccountWithSuppliers, updateAccountWithSupplier } from "../controllers/accounts.controller.js";
import { singleUpload, upload } from "../middlewares/multer.middleware.js";
const router = Router()

router.post("/create",Auth, checkRole(["ADMIN"]),upload, createAccountWithSupplier)
router.get("/supplier", Auth, checkRole(["ADMIN"]), getAllAccountWithSuppliers)
router.get("/order", Auth, checkRole(["ADMIN"]), getAccountWithOrder)
router.get("/supplier/:id",Auth, checkRole(["ADMIN"]), getAccountWithSupplierById)
router.patch("/update/:id", Auth, checkRole(["ADMIN"]),upload, updateAccountWithSupplier)
router.patch("/salFileUpload/:id", Auth, checkRole(["ADMIN"]),upload, fileUploadOfSalAttach)
router.patch("/pdf/:aid", Auth, checkRole(["ADMIN"]),singleUpload("pdf"), generatePDF)
router.delete("/delete",Auth, checkRole(["ADMIN"]), deleteAccounts)

export default router