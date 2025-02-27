import prisma from "../../prisma/prisma.js";

export const getAllSuppliers = async (req, res) => {
  try {
    const supp = await prisma.supplier.findMany({
      take: 10,
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
    const ifExist = await prisma.supplier.findUnique({
      where: { email: req.body.email },
    });
    if (ifExist)
      return res.status(400).json({ message: "supplier already there" });
    const reqFields = [
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
    for (let field of reqFields) {
      if (!req.body[field]) {
        return res.status(404).json({
          message: `Missing required field: ${field}`,
        });
      }
    }

    const supp = await prisma.supplier.create({
      data: { ...req.body, adminId: req.user?.id },
    });
    return res.status(200).json({ data: supp, message: "supplier created!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSupp = async (req, res) => {
  try {
    const { id } = req.params;
    const supp = await prisma.supplier.update({
      where: { id: id },
      data: { ...req.body },
    });
    return res.status(200).json({ message: "supplier updated", data: supp });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteSupp = async (req, res) => {
  try {
    const { ids } = req.body;
    if(!ids) return res.status(400).json({message:"missing required field ids"})
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
