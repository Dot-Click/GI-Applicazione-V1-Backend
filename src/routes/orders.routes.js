import express from "express";
import {
  archieveOrder,
  createOrder,
  deleteOrder,
  getArchivedOrders,
  getOrder,
  getOrders,
  searchOrder,
  updateOrder,
} from "../controllers/orders.controller.js";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = express.Router();

router.get("/search", Auth, checkRole(["ADMIN"]), searchOrder);
router.get("/", Auth, checkRole(["ADMIN"]), getOrders);
router.get("/archive", Auth, checkRole(["ADMIN"]), getArchivedOrders);
router.get("/:id", Auth, checkRole(["ADMIN"]), getOrder);
router.post("/create", Auth, checkRole(["ADMIN"]), upload, createOrder);
router.patch("/update/:id", Auth, checkRole(["ADMIN"]), upload, updateOrder);
router.patch("/archive/:id", Auth, checkRole(["ADMIN"]), archieveOrder);
router.delete("/delete", Auth, checkRole(["ADMIN"]), deleteOrder);


// router.post("/import-csv", Auth, importCSV);
// router.get("/export-csv", exportCSV);

export default router;
