import prisma from "../../prisma/prisma.js";
import { cloudinaryUploader } from "../lib/utils.js";

export const createEmployee = async (req, res) => {
  try {
    const reqFields = [
      "name",
      "surname",
      "taxId",
      "contractorNo",
      "sector",
      "startDate",
      "endDate",
      "municipalityOfBirth",
      "level",
      "qualification",
      "number",
      "address",
      "role",
      "email",
    ];
    const missingField = reqFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }
    const ifExist = await prisma.employee.findUnique({
      where: { email: req.body.email },
    });
    if (ifExist)
      return res.status(400).json({ message: "employee already exist" });
    const { id } = req.user;
    const emp = await prisma.employee.create({
      data: { ...req.body, adminId: id },
    });
    return res.status(200).json({ message: "employee created", data: emp });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getAllEmployee = async (req, res) => {
  try {
    const { id } = req.user;
    let { page } = req.query;
    page = parseInt(page, 10);
    if (isNaN(page) || page < 1) page = 1;

    const employees = await prisma.employee.findMany({
      where: { adminId: id },
      skip: (page - 1) * 10,
      take: 10,
    });

    return res.status(200).json({
      data: employees,
      page,
      message: "Employees fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(404).json({ message: "missing id field" });
    const emp = await prisma.employee.findUnique({
      where: { id },
    });
    if (!emp) {
      return res.status(200).json({ message: "employee not found" });
    }
    return res.status(200).json({ message: "employee fetched", data: emp });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await prisma.employee.update({
      where: { id },
      data: { ...req.body },
    });
    if (!emp) return res.status(404).json({ message: "emp not found" });
    return res.status(200).json({ message: "updated!", data: emp });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.name, description: error.message });
  }
};

export const deleteEmp = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) return res.status(400).json({ message: "missing ids" });
    const emp = await prisma.employee.deleteMany({
      where: { id: { in: ids } },
    });
    if (!emp.count) return res.status(404).json({ message: "ids not found" });
    return res.status(200).json({ message: "deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const searchEmp = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "missing 'name' query" });
    const emp = await prisma.employee.findMany({
      where: { name: { contains: name, mode: "insensitive" } },
      take: 10,
    });
    if (!emp || !emp.length)
      return res.status(404).json({ message: "employee nt found" });
    return res.status(200).json({ data: emp, message: "found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// unilav
export const createUnilav = async (req, res) => {
  try {
    const { id } = req.user;
    const reqFields = ["healthEligibility", "expiryDate", "dataRilascio"];
    const missingField = reqFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }

    const file = await cloudinaryUploader(req.file.path);
    const unilav = await prisma.unilav.create({
      data: { ...req.body, attachment: file?.secure_url },
    });
    return res.status(200).json({ message: "created!", data: unilav });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updUnilav = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "id is required" });
    const file = await cloudinaryUploader(req.file?.path || null);
    const upd = await prisma.unilav.update({
      where: { id },
      data: { ...req.body, attachment: file?.secure_url },
    });
    return res.json(upd);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const getUnilav = async (req, res) => {
  try {
    // const { id } = req.user;
    const data = await prisma.unilav.findMany({});
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getUnilavById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.unilav.findUnique({ where: { id } });
    if (!data) {
      return res.status(404).json({ message: "unilav not found" });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({ message: error.message });
  }
};

// seritia
export const createSeritia = async (req, res) => {
  try {
    const { id } = req.user;
    const reqFields = ["healthEligibility", "expiryDate", "dataRilascio"];
    const missingField = reqFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }

    const file = await cloudinaryUploader(req.file.path);
    const sertia = await prisma.seritia.create({
      data: { ...req.body, attachment: file?.secure_url },
    });
    return res.status(200).json({ message: "created!", data: sertia });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updSeritia = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "id is required" });
    const file = await cloudinaryUploader(req.file?.path || null);
    const upd = await prisma.seritia.update({
      where: { id },
      data: { ...req.body, attachment: file?.secure_url },
    });
    return res.json(upd);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const getSeritia = async (req, res) => {
  try {
    // const { id } = req.user;
    const data = await prisma.seritia.findMany({});
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getSeritiaById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.seritia.findUnique({ where: { id } });
    if (!data) {
      return res.status(404).json({ message: "seritia not found" });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({ message: error.message });
  }
};

// formazone
export const createFormazone = async (req, res) => {
  try {
    const { id } = req.user;
    const reqFields = ["training", "expiryDate", "dataRilascio"];
    const missingField = reqFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }

    const file = await cloudinaryUploader(req.file.path);
    const forma = await prisma.formazone.create({
      data: { ...req.body, attachment: file?.secure_url },
    });
    return res.status(200).json({ message: "created!", data: forma });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updateFormazone = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "id is required" });
    const file = await cloudinaryUploader(req.file?.path || null);
    const upd = await prisma.formazone.update({
      where: { id },
      data: { ...req.body, attachment: file?.secure_url },
    });
    return res.json(upd);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const getFormazone = async (req, res) => {
  try {
    // const { id } = req.user;
    const data = await prisma.formazone.findMany({ });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getFormazoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.formazone.findUnique({ where: { id } });
    if (!data) {
      return res.status(404).json({ message: "formazone not found" });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({ message: error.message });
  }
};
