import express from "express";
import {
  createSupp,
  deleteSupp,
  getAllSuppliers,
  getSupplier,
  getSuppSequence,
  searchSupp,
  updateSupp,
  updateSuppSequence,
} from "../controllers/supplier.controller.js";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";

const router = express.Router();

router.get("/search", Auth, checkRole(["ADMIN"]), searchSupp);
router.patch("/update/suppSeq", Auth, checkRole(["ADMIN"]), updateSuppSequence)
router.get("/get/suppSeq", Auth, checkRole(["ADMIN"]), getSuppSequence)
router.get("/", Auth, checkRole(["ADMIN"]), getAllSuppliers);
router.get("/:id", Auth, checkRole(["ADMIN"]), getSupplier);
router.post("/create", Auth, checkRole(["ADMIN"]), createSupp);
router.patch("/update/:id", Auth, checkRole(["ADMIN"]), updateSupp);
router.delete("/delete", Auth, checkRole(["ADMIN"]), deleteSupp);


export default router;
