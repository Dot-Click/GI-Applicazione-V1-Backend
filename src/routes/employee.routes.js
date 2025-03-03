import express from "express";
import {
  createEmployee,
  createFormazone,
  createSeritia,
  createUnilav,
  deleteEmp,
  getAllEmployee,
  getEmployee,
  searchEmp,
  updateEmployee,
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

export default router;
