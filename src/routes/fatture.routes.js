import { Router } from "express";
import { createFattureActive, getAllFattureActive, getFattureActive } from "../controllers/fatture.controller.js";
import { Auth } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/verif.middleware.js";
import { singleUpload } from "../middlewares/multer.middleware.js";

const router = Router()

router.post("/create",Auth, checkRole(["ADMIN"]),singleUpload("active"),createFattureActive)
router.get("/active",Auth, checkRole(["ADMIN"]), getAllFattureActive)
router.get("/active/:id",Auth, checkRole(["ADMIN"]), getFattureActive)

export default router