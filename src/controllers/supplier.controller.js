import prisma from "../../prisma/prisma.js";

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
    const supp = await prisma.supplier.findUnique({ where: { id: id } });
    if (!supp) return res.status(404).json({ message: "supplier not found" });
    return res.status(200).json({ message: "supplier fetched", data: supp });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createSupp = async (req, res) => {
  try {
    const { id } = req.user;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingSupplier = await prisma.supplier.findUnique({
      where: { email },
    });
    if (existingSupplier) {
      return res.status(409).json({ message: "Supplier already exists" });
    }

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

    const newSupplier = await prisma.supplier.create({
      data: {
        ...req.body,
        adminId: id,
      },
    });

    return res
      .status(201)
      .json({ message: "Supplier created successfully", data: newSupplier });
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

    const updatedSupp = await prisma.supplier.update({
      where: { id },
      data: { ...req.body },
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
    await prisma.supplier.deleteMany({ where: { id: { $in: ids } } });
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
    if (!supp) return res.status(404).json({ message: "supplier not found" });
    return res.status(200).json({ message: "found", data: supp });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
