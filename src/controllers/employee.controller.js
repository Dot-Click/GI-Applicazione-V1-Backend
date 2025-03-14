import prisma from "../../prisma/prisma.js";
import { cloudinaryUploader } from "../lib/utils.js";
import bcrypt from "bcrypt";

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
    let count = Math.round(Math.random() * 100);
    const randomPass = `employee${count}`;
    const hash = await bcrypt.hash(randomPass, 10);
    const emp = await prisma.employee.create({
      data: { ...req.body, adminId: id, password: hash },
      omit: { password: true },
    });
    return res.status(200).json({
      message: "employee created",
      data: emp,
      login_crdentials: { password: randomPass, email: emp.email },
    });
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
      include:{
        unilavs: {take: 1},
        seritias: {take: 1},
        formazones: {take: 4}
      }
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
    const already = await prisma.employee.findUnique({where:{email:req.body.email}})
    if(already) return res.status(400).json({message:"Email is not available"})
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
      omit: { password: true },
    });
    if (!emp || !emp.length)
      return res.status(404).json({ message: "employee nt found" });
    return res.status(200).json({ data: emp, message: "found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateEmpSequence = async (req, res) => {
  try {
    const { id } = req.user;
    const { addedColArray, visibleColArray } = req.body;
    if (!addedColArray || !visibleColArray) {
      return res.status(400).json({ error: "missing required fields" });
    }
    if (!Array.isArray(addedColArray) || !Array.isArray(visibleColArray))
      return res.status(406).json({ error: "Invalid type" });
    const reqOrdval = [
      "firstName",
      "lastName",
      "birthPlace",
      "contractor",
      "homeAddress",
      "qualification",
      "role",
      "phoneNumber",
      "emailAddress",
      "startDate",
      "endDate",
      "level",
      "sector",
      "fiscalCode",
      "actions"
    ];
    const invalidFields = [
      ...addedColArray.filter((field) => !reqOrdval.includes(field)),
      ...visibleColArray.filter((field) => !reqOrdval.includes(field)),
    ];
    
    if (invalidFields.length > 0) {
      return res
        .status(422)
        .json({ error: `Invalid fields found: ${invalidFields.join(", ")}` });
    } 
    await prisma.empSequence.upsert({
      where: { adminId: id },
      update: {
        added_col_array: addedColArray,
        visible_col_array: visibleColArray,
      },
      create: {
        added_col_array: addedColArray,
        visible_col_array: visibleColArray,
        adminId: id,
      },
    });
    return res.status(200).json({ message: "sequence updated!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getEmpSequence = async (req, res) => {
  try {
    const { id } = req.user;
    const seq = await prisma.empSequence.findUnique({ where: { adminId: id } });
    if (!seq) {
      return res.status(404).json({ message: "sequence not found" });
    }
    return res.status(200).json(seq);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const archieve = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Bad request" });

    const ord = await prisma.employee.findUnique({
      where: { id },
    });
    if (!ord) return res.status(404).json({ message: "Employee not found" });
    if (ord.archieved === "true") {
      await prisma.employee.update({
        where: { id },
        data: { archieved: "false" },
      });
      return res.status(200).json({ message: "Employee unarchieved!" });
    }

    await prisma.employee.update({
      where: { id },
      data: { archieved: "true" },
    });
    return res.status(200).json({ message: "Employee archieved!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getArchivedEmployees = async (req, res) => {
  try {
    const { id } = req.user;
    let { page } = req.query;
    page = parseInt(page, 10);
    if (isNaN(page) || page < 1) page = 1;
    const employees = await prisma.employee.findMany({
      where: { adminId: id, archieved: "true" },
      skip: (page - 1) * 10,
      take: 10,
    });
    if (!employees) return res.status(404).json({ message: "No archived employees" });
    return res.status(200).json({ data: employees, message: "found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// unilav
export const createUnilav = async (req, res) => {
  try {
    const { eid } = req.params;
    const reqFields = ["healthEligibility", "expiryDate", "dataRilascio"];
    const missingField = reqFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }

    const file = await cloudinaryUploader(req.file.path);
    const unilav = await prisma.unilav.create({
      data: { ...req.body, attachment: file?.secure_url, employeeId:eid },
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
    return res.status(200).json(upd);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const getUnilav = async (req, res) => {
  try {
    const { eid } = req.params;
    let { page } = req.query;
    page = parseInt(page, 10);
    if (isNaN(page) || page < 1) page = 1;
    const data = await prisma.unilav.findMany({
      skip: (page - 1) * 1,
      take: 1,
      where:{employeeId: eid}
    });
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
export const deleteUnilavs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids)
      return res.status(400).json({ error: "missing required field ids" });
    const uni = await prisma.unilav.deleteMany({
      where: { id: { in: ids } },
    });
    if (!uni.count) {
      return res.status(404).json({ error: "no ids found" });
    }
    return res.status(200).json({ message: "unilavs deleted" });
  } catch (error) {
    return res.status(200).json({ message: error.message });
  }
};

// seritia
export const createSeritia = async (req, res) => {
  try {
    const { eid } = req.params;
    const reqFields = ["healthEligibility", "expiryDate", "dataRilascio"];
    const missingField = reqFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }

    const file = await cloudinaryUploader(req.file.path);
    const sertia = await prisma.seritia.create({
      data: { ...req.body, attachment: file?.secure_url, employeeId:eid },
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
    return res.status(200).json(upd);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const getSeritia = async (req, res) => {
  try {
    const { eid } = req.params;
    let { page } = req.query;
    page = parseInt(page, 10);
    if (isNaN(page) || page < 1) page = 1;
    const data = await prisma.seritia.findMany({
      skip: (page - 1) * 1,
      take: 1,
      where:{employeeId: eid}
    });
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
export const deleteSeritia = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids)
      return res.status(400).json({ error: "missing required field ids" });
    const uni = await prisma.seritia.deleteMany({
      where: { id: { in: ids } },
    });
    if (!uni.count) {
      return res.status(404).json({ error: "no ids found" });
    }
    return res.status(200).json({ message: "seritia deleted" });
  } catch (error) {
    return res.status(200).json({ message: error.message });
  }
};

// formazone
export const createFormazone = async (req, res) => {
  try {
    const { eid } = req.params;
    if(!eid) return res.status(400).json({message:"Bad Request"})
    const reqFields = ["training", "expiryDate", "dataRilascio"];
    const missingField = reqFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }

    const file = await cloudinaryUploader(req.file.path);
    const forma = await prisma.formazone.create({
      data: { ...req.body, attachment: file?.secure_url, employeeId: eid },
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
    return res.status(200).json(upd);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const getFormazone = async (req, res) => {
  try {
    const { eid } = req.params;
    let { page } = req.query;
    page = parseInt(page, 10);
    if (isNaN(page) || page < 1) page = 1;
    const data = await prisma.formazone.findMany({
      skip: (page - 1) * 4,
      take: 4,
      where:{employeeId: eid}
    });
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
export const deleteFormazone = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids)
      return res.status(400).json({ error: "missing required field ids" });
    const uni = await prisma.formazone.deleteMany({
      where: { id: { in: ids } },
    });
    if (!uni.count) {
      return res.status(404).json({ error: "no ids found" });
    }
    return res.status(200).json({ message: "formazone deleted" });
  } catch (error) {
    return res.status(200).json({ message: error.message });
  }
};
