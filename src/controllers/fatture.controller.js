import prisma from "../../prisma/prisma.js";
import { cloudinaryUploader } from "../lib/utils.js";

export const createFattureActive = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      customerName,
      vat,
      name,
      taxAmt,
      docDate,
      vatRate,
      split,
      typology,
      yearOfCompetence,
      protocol,
      type,
      Processed,
      docNo,
    } = req.body;

    const requiredFields = [
      "customerName",
      "vat",
      "name",
      "taxAmt",
      "docDate",
      "vatRate",
      "split",
      "typology",
      "yearOfCompetence",
      "protocol",
    ];

    const missingField = requiredFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }
    const exits = await prisma.invoice.findUnique({ where: { docNo } });
    if (exits) return res.status(400).json({ message: "already exist" });

    const file = await cloudinaryUploader(req.file.path);

    const fatture = await prisma.invoice.create({
      data: {
        vat,
        name,
        type,
        Processed,
        taxAmt,
        docDate: new Date(docDate),
        vatRate,
        split,
        typology,
        yearOfCompetence,
        protocol,
        docNo,
        attachment: file?.secure_url,
        admin: {
          connect: { id },
        },
        Customer: {
          connect: {
            companyName: customerName,
          },
        },
      },
      omit: { supplierId: true },
    });

    return res.status(200).json({ message: "invoice created", fatture });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllFattureActive = async (req, res) => {
  try {
    const { id } = req.user;
    let activeFattures = await prisma.invoice.findMany({
      where: { adminId: id, type: "attive" },
      include: { Customer: { select: { companyName: true } } },
      omit: { supplierId: true },
    });
    activeFattures = activeFattures
      .map((fatture) => ({
        ...fatture,
        customerName: fatture.Customer.companyName,
      }))
      .map(({ Customer, ...rest }) => rest);
    return res.status(200).json({ message: "fetched!", data: activeFattures });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFattureActive = async (req, res) => {
    try {
      const { id } = req.params;
  
      const activeFatture = await prisma.invoice.findUnique({
        where: { id },
        include: { Customer: { select: { companyName: true } } },
      });
  
      if (!activeFatture) {
        return res.status(404).json({ message: "not found" });
      }
  
      const { Customer, ...rest } = activeFatture;
      const result = {
        ...rest,
        customerName: Customer?.companyName || null,
      };
  
      return res.status(200).json({ message: "found", data: result });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
};


  
