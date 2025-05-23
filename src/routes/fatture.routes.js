import { Router } from "express";
import { createBulkAttives, createBulkPassives, createCosti, createFattureActive, createFatturePassive, createRicavi, deleteCosti, deleteFattures, deleteRicavi, getAllCostis, getAllFattureActive, getAllFatturePassiva, getAllRicavis, getCosti, getFattureActive, getFatturePassive, getRicavi } from "../controllers/fatture.controller.js";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";
import { singleUpload } from "../middlewares/multer.middleware.js";

const router = Router()

router.post("/create/active",Auth, checkRole(["ADMIN"]),singleUpload("active"),createFattureActive)
router.post("/create/passive",Auth, checkRole(["ADMIN"]),singleUpload("passive"),createFatturePassive)
router.post("/create/attives",Auth, checkRole(["ADMIN"]),createBulkAttives)
router.post("/create/passives",Auth, checkRole(["ADMIN"]),createBulkPassives)
router.get("/active",Auth, checkRole(["ADMIN"]), getAllFattureActive)
router.get("/passive",Auth, checkRole(["ADMIN"]), getAllFatturePassiva)
router.get("/active/:id",Auth, checkRole(["ADMIN"]), getFattureActive)
router.get("/passive/:id", Auth, checkRole(["ADMIN"]), getFatturePassive)
router.get("/ricavi/:id",Auth, checkRole(["ADMIN"]),getRicavi)
router.get("/costi/:id",Auth, checkRole(["ADMIN"]),getCosti)
router.get("/ricavis",Auth,checkRole(["ADMIN"]), getAllRicavis)
router.get("/costis",Auth,checkRole(["ADMIN"]), getAllCostis)
router.post("/create/ricavi", Auth, checkRole(["ADMIN"]), createRicavi)
router.post("/create/costi", Auth, checkRole(["ADMIN"]), createCosti)
router.delete("/delete", Auth, checkRole(["ADMIN"]), deleteFattures)
router.delete("delete/ricavi", Auth, checkRole(["ADMIN"]), deleteRicavi)
router.delete("delete/costi", Auth, checkRole(["ADMIN"]), deleteCosti)

export default router