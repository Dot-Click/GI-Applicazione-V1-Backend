import { Router } from "express";
import { createCosti, createFattureActive, createRicavi, getAllCostis, getAllFattureActive, getAllRicavis, getCosti, getFattureActive, getRicavi } from "../controllers/fatture.controller.js";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";
import { singleUpload } from "../middlewares/multer.middleware.js";

const router = Router()

router.post("/create",Auth, checkRole(["ADMIN"]),singleUpload("active"),createFattureActive)
router.get("/active",Auth, checkRole(["ADMIN"]), getAllFattureActive)
router.get("/active/:id",Auth, checkRole(["ADMIN"]), getFattureActive)
router.get("/ricavi/:id",Auth, checkRole(["ADMIN"]),getRicavi)
router.get("/costi/:id",Auth, checkRole(["ADMIN"]),getCosti)
router.get("/ricavis",Auth,checkRole(["ADMIN"]), getAllRicavis)
router.get("/costis",Auth,checkRole(["ADMIN"]), getAllCostis)
router.post("/create/ricavi", Auth, checkRole(["ADMIN"]), createRicavi)
router.post("/create/costi", Auth, checkRole(["ADMIN"]), createCosti)

export default router