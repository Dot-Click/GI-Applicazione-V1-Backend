import express from "express";
import {
  createCust,
  deleteCust,
  getAllCustomers,
  getCustomer,
  login,
  logout,
  searchCustomer,
  signup,
  updateCust,
} from "../controllers/customer.controller.js";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";

const router = express.Router();

// client/user - authentication routes
// router.post("/signup-client", Auth, checkRole(["ADMIN"]), signup);
router.post("/login-client", checkRole(["USER"]), login);
router.post("/logout-client", Auth, checkRole(["USER"]), logout); //optional

router.get("/search", Auth, checkRole(["ADMIN"]), searchCustomer);
router.get("/", Auth, checkRole(["ADMIN"]), getAllCustomers);
router.get("/:id", Auth, checkRole(["ADMIN"]), getCustomer);
router.post("/create", Auth, checkRole(["ADMIN"]), createCust);
router.patch("/update/:id", Auth, checkRole(["ADMIN"]), updateCust);
router.delete("/delete", Auth, checkRole(["ADMIN"]), deleteCust);


export default router;
