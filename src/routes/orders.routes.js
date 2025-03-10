import express from "express";
import {
  archieve,
  createOrder,
  deleteOrder,
  getArchivedOrders,
  getOrder,
  getOrders,
  getOrderSequence,
  searchOrder,
  unArchieve,
  updateOrder,
  updateOrderSequence,
} from "../controllers/orders.controller.js";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = express.Router();

router.get("/search", Auth, checkRole(["ADMIN"]), searchOrder);
router.get("/", Auth, checkRole(["ADMIN"]), getOrders);
router.patch("/update/orderSeq", Auth, checkRole(["ADMIN"]), updateOrderSequence)
router.get("/get/orderSeq", Auth, checkRole(["ADMIN"]), getOrderSequence)
router.get("/archive", Auth, checkRole(["ADMIN"]), getArchivedOrders);
router.get("/:id", Auth, checkRole(["ADMIN"]), getOrder);
router.post("/create", Auth, checkRole(["ADMIN"]), upload, createOrder);
router.patch("/update/:id", Auth, checkRole(["ADMIN"]), upload, updateOrder);
router.patch("/archive/:id", Auth, checkRole(["ADMIN"]), archieve);
router.patch("/unarchive/:id", Auth, checkRole(["ADMIN"]), unArchieve);
router.delete("/delete", Auth, checkRole(["ADMIN"]), deleteOrder);


// router.post("/import-csv", Auth, importCSV);
// router.get("/export-csv", exportCSV);

export default router;
