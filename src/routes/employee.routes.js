import express from "express";
import {
  createEmployee,
  createFormazone,
  createSeritia,
  createUnilav,
  deleteEmp,
  deleteFormazone,
  deleteSeritia,
  deleteUnilavs,
  getAllEmployee,
  getEmployee,
  getEmpSequence,
  getFormazone,
  getFormazoneById,
  getSeritia,
  getSeritiaById,
  getUnilav,
  getUnilavById,
  searchEmp,
  updateEmployee,
  updateEmpSequence,
  updateFormazone,
  updSeritia,
  updUnilav,
} from "../controllers/employee.controller.js";
import { Auth } from "../middlewares/auth.middleware.js";
import { singleUpload } from "../middlewares/multer.middleware.js";
const router = express.Router();

router.post("/create", Auth, createEmployee);
router.get("/search", Auth, searchEmp);
router.get("/", Auth, getAllEmployee);

router.patch("/update/empSeq", Auth, updateEmpSequence)
router.get("/get/empSeq", Auth, getEmpSequence)

router.get("/unilav", Auth, getUnilav);
router.get("/unilav/:id", Auth, getUnilavById);
router.get("/seritia", Auth, getSeritia);
router.get("/seritia/:id", Auth, getSeritiaById);
router.get("/formazone", Auth, getFormazone);
router.get("/formazone/:id", Auth, getFormazoneById);

router.get("/:id", Auth, getEmployee);
router.patch("/update/:id", Auth, updateEmployee);
router.delete("/delete", Auth, deleteEmp);

// unilav
router.post(
  "/unilav/create",
  Auth,
  singleUpload.single("unilav"),
  createUnilav
);
router.patch(
  "/unilav/update/:id",
  Auth,
  singleUpload.single("unilav"),
  updUnilav
);
router.delete("/unilav/delete", Auth, deleteUnilavs);

// seritia
router.post(
  "/seritia/create",
  Auth,
  singleUpload.single("seritia"),
  createSeritia
);
router.patch(
  "/seritia/update/:id",
  Auth,
  singleUpload.single("seritia"),
  updSeritia
);
router.delete("/seritia/delete", Auth, deleteSeritia);

//formazone
router.post(
  "/formazone/create",
  Auth,
  singleUpload.single("formazone"),
  createFormazone
);
router.patch(
  "/formazone/update/:id",
  Auth,
  singleUpload.single("formazone"),
  updateFormazone
);
router.delete("/formazone/delete", Auth, deleteFormazone);

export default router;
