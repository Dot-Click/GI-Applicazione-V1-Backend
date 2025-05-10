import { Router } from "express";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";
import { getAllmarginalities, getMarginalitaOfCosti, getMarginalitaOfOrder, getMarginalitaOfRicavi } from "../controllers/marginalita.controller.js";

const router = Router()

router.get("/all", Auth, checkRole(["ADMIN"]), getAllmarginalities)
router.get("/order/:id", Auth, checkRole(["ADMIN"]), getMarginalitaOfOrder)
router.get("/ricavi/:id", Auth, checkRole(["ADMIN"]), getMarginalitaOfRicavi)
router.get("/costi/:id", Auth, checkRole(["ADMIN"]), getMarginalitaOfCosti)

export default router