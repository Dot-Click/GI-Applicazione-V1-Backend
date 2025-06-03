import { Router } from "express";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";
import { createAccountWithClient, createAccountWithSupplier, deleteAccounts, deleteCDP, deleteSAL, generatePDF, generatePDF_C, getAccountWithClientById, getAccountWithOrder, getAccountWithSupplierById, getAllAccountWithClient, getAllAccountWithSuppliers, updateAccountFields, updateAccountWithSupplier, updateCDP, updateSAL } from "../controllers/accounts.controller.js";
import { singleUpload, upload } from "../middlewares/multer.middleware.js";
const router = Router()

// client routes
router.post("/create/customer", Auth,checkRole(["ADMIN"]),upload, createAccountWithClient)
router.patch("/update/:id", Auth,checkRole(["ADMIN"]),updateAccountFields)
router.get("/customer", Auth, checkRole(["ADMIN"]), getAllAccountWithClient)
router.get("/customer/:id", Auth, checkRole(["ADMIN"]), getAccountWithClientById)
router.patch("customer/pdf/:aid", Auth, checkRole(["ADMIN"]),singleUpload("cdp"), generatePDF_C)

router.post("/create/supplier",Auth, checkRole(["ADMIN"]),upload, createAccountWithSupplier)
router.get("/supplier", Auth, checkRole(["ADMIN"]), getAllAccountWithSuppliers)
router.get("/order/:ordCode", Auth, checkRole(["ADMIN"]), getAccountWithOrder)
router.get("/supplier/:id",Auth, checkRole(["ADMIN"]), getAccountWithSupplierById)
// router.patch("/update/:id", Auth, checkRole(["ADMIN"]),upload, updateAccountWithSupplier)
// router.patch("/salFileUpload/:id", Auth, checkRole(["ADMIN"]),upload, fileUploadOfSalAttach)
router.patch("/pdf/:aid", Auth, checkRole(["ADMIN"]),singleUpload("sal"), generatePDF)
router.delete("/delete",Auth, checkRole(["ADMIN"]), deleteAccounts)

// sals & cdp
router.patch("/sal/update/:id",Auth, checkRole(["ADMIN"]),updateSAL)
router.patch("/cdp/update/:id",Auth, checkRole(["ADMIN"]),updateCDP)
router.delete("/sal/delete/:id",Auth, checkRole(["ADMIN"]),deleteSAL)
router.delete("/cdp/delete/:id",Auth, checkRole(["ADMIN"]),deleteCDP)

export default router