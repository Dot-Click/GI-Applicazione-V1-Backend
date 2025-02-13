import express from "express";
import { createOrder, getOrders } from "../controllers/orders.controller.js";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";
const router = express.Router();

router.get("/", Auth, checkRole(["USER"]), getOrders)
router.post("/create", Auth, checkRole(["USER"]), createOrder);

export default router;
