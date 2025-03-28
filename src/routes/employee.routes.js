import express from "express";
import {
  archieve,
  createEmployee,
  createEmployees,
  createFormazone,
  createSeritia,
  createUnilav,
  deleteEmp,
  deleteFormazone,
  deleteSeritia,
  deleteUnilavs,
  getAllEmployee,
  getArchivedEmployees,
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
router.post("/createMany", Auth, createEmployees);
router.get("/search", Auth, searchEmp);
router.get("/", Auth, getAllEmployee);

router.patch("/archieve/:id", Auth, archieve)
router.get("/archieve", Auth, getArchivedEmployees)

router.patch("/update/empSeq", Auth, updateEmpSequence)
router.get("/get/empSeq", Auth, getEmpSequence)

router.get("/unilav/:eid", Auth, getUnilav);
router.get("/unilav/:id", Auth, getUnilavById);
router.get("/seritia/:eid", Auth, getSeritia);
router.get("/seritia/:id", Auth, getSeritiaById);
router.get("/formazone/:eid", Auth, getFormazone);
router.get("/formazone/:id", Auth, getFormazoneById);

router.get("/:id", Auth, getEmployee);
router.patch("/update/:id", Auth, updateEmployee);
router.delete("/delete", Auth, deleteEmp);

// unilav
router.post(
  "/unilav/create/:eid",
  Auth,
  singleUpload("unilav"),
  createUnilav
);
router.patch(
  "/unilav/update/:id",
  Auth,
  singleUpload("unilav"),
  updUnilav
);
router.delete("/unilav/delete", Auth, deleteUnilavs);

// seritia
router.post(
  "/seritia/create/:eid",
  Auth,
  singleUpload("seritia"),
  createSeritia
);
router.patch(
  "/seritia/update/:id",
  Auth,
  singleUpload("seritia"),
  updSeritia
);
router.delete("/seritia/delete", Auth, deleteSeritia);

//formazone
router.post(
  "/formazone/create/:eid",
  Auth,
  singleUpload("formazone"),
  createFormazone
);
router.patch(
  "/formazone/update/:id",
  Auth,
  singleUpload("formazone"),
  updateFormazone
);
router.delete("/formazone/delete", Auth, deleteFormazone);

export default router;
