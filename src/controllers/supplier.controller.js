import prisma from "../../prisma/prisma.js";
import bcrypt from "bcrypt";

const orderStateMap = {
  ON_HOLD: "In attesa",
  IN_PROGRESS: "In corso",
  CANCELLED: "Cancellato",
  COMPLETATO: "Completato",
};

export const getAllSuppliers = async (req, res) => {
  try {
    const { id } = req.user;
    let { page } = req.query;
    page = parseInt(page, 10);
    if (isNaN(page) || page < 1) page = 1;
    const supp = await prisma.supplier.findMany({
      where: { adminId: id },
      take: 10,
      skip: (page - 1) * 10,
      omit: { password: true },
    });
    return res
      .status(200)
      .json({ data: supp, message: "All supplier fetched" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "id not found" });
    const supp = await prisma.supplier.findUnique({
      where: { id },
      include: {orders: true},
      omit: { password: true },
    });
    if (!supp) return res.status(404).json({ message: "supplier not found" });
    if (!supp.orders.length) {
      return res.status(200).json({ message: "No current orders", data: supp });
    }
    supp.orders =  supp.orders
    .map((order) => ({
   ...order,
   state: orderStateMap[order.state] || order.state,
    }));
    return res.status(200).json({ message: "supplier fetched", data: supp });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createSupps = async (req,res) => {
  try {
    const { id } = req.user;
    const {suppliers} = req.body
    if(!suppliers) return res.status(404).json({message:"Bad Request"})
    const requiredFields = [
      "companyName",
      "vat",
      "taxId",
      "nation",
      "province",
      "common",
      "cap",
      "address",
      "pec",
      "email",
      "telephone",
    ];
     const invalidsupplier = suppliers.find(supplier => 
      requiredFields.some(field => !supplier[field])
    );
    if (invalidsupplier) {
      const missingFields = requiredFields.filter(field => !invalidsupplier[field]);
      return res.status(400).json({
        message: `An supplier is missing required fields: ${missingFields.join(", ")}`,
      });
    }
    const multiplesupplier = await prisma.supplier.createMany({data: suppliers.map(supplier => ({ ...supplier, adminId: id })), skipDuplicates: true})
    return res.status(200).json({message:`suppliers added: ${multiplesupplier.count}`})
  } catch (error) {
    return res.status(500).json({message: error.message})
  }
};

export const createSupp = async (req, res) => {
  try {
    const { id } = req.user;
    const { email } = req.body;

    const requiredFields = [
      "companyName",
      "vat",
      "taxId",
      "nation",
      "province",
      "common",
      "cap",
      "address",
      "pec",
      "email",
      "telephone",
    ];
    
    if (!requiredFields.every((field) => req.body[field])) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const existingSupplier = await prisma.supplier.findUnique({
      where: { email },
    });
    if (existingSupplier) {
      return res.status(409).json({ message: "Supplier already exists" });
    }
    let count = Math.round(Math.random() * 100);
    const randomPass = `supplier${count}`;
    const hash = await bcrypt.hash(randomPass, 10);
    const newSupplier = await prisma.supplier.create({
      data: {
        ...req.body,
        adminId: id,
        email,
        password: hash,
      },
      omit: { password: true },
    });

    return res.status(201).json({
      message: "Supplier created successfully",
      data: newSupplier,
      login_crdentials: { password: randomPass, email: newSupplier.email },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSuppSequence = async (req, res) => {
  try {
    const { id } = req.user;
    const { addedColArray, visibleColArray } = req.body;
    if (!addedColArray || !visibleColArray) {
      return res.status(400).json({ error: "missing required fields" });
    }
    if (!Array.isArray(addedColArray) || !Array.isArray(visibleColArray))
      return res.status(406).json({ error: "Invalid type" });
    const reqOrdval = [
      "nation",
      "companyName",
      "vatNumber",
      "fiscalCode",
      "province",
      "address",
      "municipality",
      "zipCode",
      "pecAddress",
      "phoneNumber",
      "emailAddress",
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
    await prisma.supSequence.upsert({
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

export const getSuppSequence = async (req, res) => {
  try {
    const { id } = req.user;
    const seq = await prisma.supSequence.findUnique({ where: { adminId: id } });
    if (!seq) {
      return res.status(404).json({ message: "sequence not found", seq });
    }
    return res.status(200).json(seq);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSupp = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Supplier ID is required" });
    }

    const existingSupp = await prisma.supplier.findUnique({ where: { id } });
    if (!existingSupp) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    const {email} = req.body
    if(email) return res.status(400).json({message:"email is non-editable"})
    const updatedSupp = await prisma.supplier.update({
      where: { id },
      data: { ...req.body },
      omit: { password: true },
    });

    return res
      .status(200)
      .json({ message: "Supplier updated successfully", data: updatedSupp });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteSupp = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids)
      return res.status(400).json({ message: "missing required field ids" });
    const c = await prisma.supplier.deleteMany({ where: { id: { in: ids } } });
    if (!c.count) return res.status(404).json({ message: "ids not found" });
    return res.status(200).json({ message: "supplier deleted!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const searchSupp = async (req, res) => {
  try {
    const { companyName } = req.query;
    if (!companyName)
      return res
        .status(400)
        .json({ message: "query param 'companyName' is not found" });
    const supp = await prisma.supplier.findMany({
      where: { companyName: { contains: companyName, mode: "insensitive" } },
      omit: { password: true },
    });
    if (!supp || !supp.length)
      return res.status(404).json({ message: "supplier not found" });
    return res.status(200).json({ message: "found", data: supp });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
