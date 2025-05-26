import prisma from "../../prisma/prisma.js";
import { cloudinaryUploader, formatDate, formatNumberWithThousands } from "../lib/utils.js";

const AccRoles = {
  Approvato: "Approvato",
  Da_approvare: "Da approvare",
  Non_approvata: "Non approvata",
};

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
      "docNo",
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

    return res.status(200).json({ message: "invoice created", data:fatture });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createFatturePassive = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      supplierName,
      vat,
      name,
      taxAmt,
      docDate,
      vatRate,
      split,
      typology,
      yearOfCompetence,
      protocol,
      docNo,
    } = req.body;
    
    const requiredFields = [
      "supplierName",
      "vat",
      "name",
      "taxAmt",
      "docDate",
      "vatRate",
      "split",
      "docNo",
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
        taxAmt,
        docDate: new Date(docDate),
        vatRate,
        split,
        type: "passive",
        typology,
        yearOfCompetence,
        protocol,
        docNo,
        attachment: file?.secure_url,
        admin: {
          connect: { id },
        },
        supplier: {
          connect: {
            companyName: supplierName,
          },
        },
      },
      omit: { customerId: true },
    });

    return res.status(200).json({ message: "invoice created", data:fatture });
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
        docDate: formatDate(fatture.docDate),
        taxAmt: formatNumberWithThousands(Number(fatture.taxAmt.toFixed(2)))+"€",
        customerName: fatture.Customer.companyName,
      }))
      .map(({ Customer, ...rest }) => rest);
    return res.status(200).json({ message: "fetched!", data: activeFattures });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllFatturePassiva = async (req, res) => {
  try {
    const { id } = req.user;
    let passiveFatture = await prisma.invoice.findMany({
      where: { adminId: id, type: "passive" },
      include: { supplier: { select: { companyName: true } } },
      omit: { customerId: true },
    });
    passiveFatture = passiveFatture
      .map((fatture) => ({
        ...fatture,
        docDate: formatDate(fatture.docDate),
        taxAmt: formatNumberWithThousands(Number(fatture.taxAmt.toFixed(2)))+"€",
        supplierName: fatture?.supplier?.companyName,
      }))
      .map(({ supplier, ...rest }) => rest);
    return res.status(200).json({ message: "fetched!", data: passiveFatture });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFattureActive = async (req, res) => {
  try {
    const { id } = req.params;

    const activeFatture = await prisma.invoice.findUnique({
      where: { id, type: "attive" },
      include: {
        Customer: {
          select: {
            companyName: true,
            ricavi:true,
          },
        },
      },
      omit: { supplierId: true },
    });

    if (!activeFatture) {
      return res.status(404).json({ message: "not found" });
    }

    const { Customer, ...rest } = activeFatture;
    const result = {
      ...rest,
      docDate: formatDate(rest.docDate),
      customerName: Customer?.companyName || null,
      ricavis: Customer.ricavi,
    };

    return res.status(200).json({ message: "found", data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFatturePassive = async (req, res) => {
  try {
    const { id } = req.params;

    const passiveFatture = await prisma.invoice.findUnique({
      where: { id, type: "passive" },
      include: {
        supplier: {
          select: {
            companyName: true,
            costi: true,
            account: {
              select: {
                sal: true,
                progressive_SAL_amount: true,
                date: true,
                status: true,
                see_SAL: true,
                wbs: true,
                supplier: { select: { companyName: true } },
                order: { select: { description: true, workAmount: true } },
              },
            },
          },
        },
      },
      omit: { customerId: true },
    });

    if (!passiveFatture) {
      return res.status(404).json({ message: "not found" });
    }

    const { supplier, ...rest } = passiveFatture;

    const allSals = supplier.account.flatMap((acc) => acc.sal);
    const salLength = allSals.length;
    const totalAgreedCost = allSals.reduce(
      (sum, sal) => sum + Number(sal.agreed || 0),
      0
    );

    const firstAccount = supplier.account[0];
    const description = firstAccount?.order?.description || null;
    const dateAcc = firstAccount?.date || null;
    const result = {
      ...rest,
      docDate: formatDate(rest.docDate),
      costi: supplier?.costi,
      accTotalAgreedCost: totalAgreedCost?.toFixed(2) + "€",
      accSupplierName: supplier?.companyName || null,
      accOrdDesc: description,
      accDate: formatDate(dateAcc),
      accStatus: firstAccount?.status || null,
      relatedAcc: supplier.account.map((acc) => ({
        // ...acc,
        status: AccRoles[acc.status] || acc.status,
        date: formatDate(acc.date),
        wbs: acc.wbs,
        see_SAL: acc.see_SAL,
        supplierName: acc.supplier?.companyName || 'N/A',
        ordDesc: acc.order.description,
        workAmount: formatNumberWithThousands(Number(acc.order.workAmount.toFixed(2)))+"€",
        total_sal: acc.sal.length,})),
    };
    return res.status(200).json({
      message: "found",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createRicavi = async (req, res) => {
  try {
    const { id } = req.user;
    const requiredFields = [
      "customerName",
      "wbs",
      "iva",
      "workSite",
      "note",
      "docDate",
      "docNo",
      "yearOfCompetence",
      "revAmt",
      "advancePayment",
      "withHoldAmt",
    ];
    const {
      customerName,
      iva,
      workSite,
      docDate,
      yearOfCompetence,
      revAmt,
      note,
      docNo,
      advancePayment,
      withHoldAmt,
      wbs,
    } = req.body;
    const missingField = requiredFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }
    const already = await prisma.ricavi.findUnique({ where: { docNo } });
    if (already)
      return res.status(400).json({ message: "ricavi already exist" });
    const ricavi = await prisma.ricavi.create({
      data: {
        iva,
        workSite,
        docDate: new Date(docDate),
        yearOfCompetence,
        revAmt,
        advancePayment,
        docNo,
        note,
        withHoldAmt,
        wbs,
        admin: {
          connect: { id },
        },
        Customer: {
          connect: { companyName: customerName },
        },
      }
    });
    return res.status(200).json({ message: "created!", data: ricavi });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCosti = async (req, res) => {
  const { id } = req.user;
  try {
    const requiredFields = [
      "supplierName",
      "wbs",
      "iva",
      "workSite",
      "note",
      "docDate",
      "docNo",
      "yearOfCompetence",
      "revAmt",
      "advancePayment",
      "withHoldAmt",
    ];
    const {
      supplierName,
      iva,
      workSite,
      docDate,
      yearOfCompetence,
      revAmt,
      docNo,
      note,
      advancePayment,
      withHoldAmt,
      wbs,
    } = req.body;
    const missingField = requiredFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }
    const already = await prisma.costi.findUnique({ where: { docNo } });
    if (already)
      return res.status(400).json({ message: "costi already exist" });
    const costi = await prisma.costi.create({
      data: {
        iva,
        workSite,
        docDate: new Date(docDate),
        yearOfCompetence,
        revAmt,
        docNo,
        advancePayment,
        note,
        withHoldAmt,
        wbs,
        admin: {
          connect: { id },
        },
        supplier: {
          connect: { companyName: supplierName },
        },
      }
    });
    return res.status(200).json({ message: "created!", data: costi });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllRicavis = async (req, res) => {
  try {
    const { id } = req.user;
    let ricavis = await prisma.ricavi.findMany({
      where: { adminId: id },
      include: { Customer: { select: { companyName: true } } },
    });
    ricavis = ricavis
      .map((obj) => ({
        ...obj,
        customerName: obj.Customer.companyName,
        revAmt: formatNumberWithThousands(Number(obj.revAmt.toFixed(2)))+"€",
        withHoldAmt: formatNumberWithThousands(Number(obj.withHoldAmt.toFixed(2)))+"€",
        advancePayment: formatNumberWithThousands(Number(obj.advancePayment.toFixed(2)))+"€",
        docDate: formatDate(obj.docDate),
      }))
      .map(({ Customer, ...rest }) => rest);
    return res.status(200).json({ message: "fetched!", data: ricavis });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getRicavi = async (req, res) => {
  try {
    const { id } = req.params;
    const ricavi = await prisma.ricavi.findUnique({
      where: { id },
      include: {
        Customer: {
          select: { companyName: true, invoices: { select: { docNo: true } } },
        },
      },
    });
    return res
      .status(200)
      .json({
        message: "fetched",
        data: {
          ...ricavi,
          customerName: ricavi.Customer.companyName,
          docDate: formatDate(ricavi.docDate),
        },
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllCostis = async (req, res) => {
  try {
    const { id } = req.user;
    let costis = await prisma.costi.findMany({
      where: { adminId: id },
      include: {
        supplier: {
          include: { invoices: { select: { docDate: true, docNo: true } } },
        },
      },
    });
    costis = costis
      .map((obj) => ({
        ...obj,
        supplierName: obj.supplier.companyName,
        revAmt: formatNumberWithThousands(Number(obj.revAmt.toFixed(2)))+"€",
        withHoldAmt: formatNumberWithThousands(Number(obj.withHoldAmt.toFixed(2)))+"€",
        advancePayment: formatNumberWithThousands(Number(obj.advancePayment.toFixed(2)))+"€",
        docDate: formatDate(obj.docDate),
      }))
      .map(({ supplier, ...rest }) => rest);
    return res.status(200).json({ message: "fetched!", data: costis });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCosti = async (req, res) => {
  try {
    const { id } = req.params;
    const costi = await prisma.costi.findUnique({
      where: { id },
      include: {
        supplier: {
          select: { companyName: true, invoices: { select: { docNo: true } } },
        },
      },
    });
    return res
      .status(200)
      .json({
        message: "fetched",
        data: {
          ...costi,
          supplierName: costi.supplier.companyName,
          docDate: formatDate(costi.docDate),
        },
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteFattures = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) return res.status(400).json({ message: "Bad request" });
    const cust = await prisma.invoice.deleteMany({
      where: { id: { in: ids } },
    });
    if (!cust.count) return res.status(404).json({ message: "ids not found" });
    return res.status(200).json({ message: "fatture deleted deleted!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteRicavi = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) return res.status(400).json({ message: "Bad request" });
    const cust = await prisma.ricavi.deleteMany({
      where: { id: { in: ids } },
    });
    if (!cust.count) return res.status(404).json({ message: "ids not found" });
    return res.status(200).json({ message: "ricavi deleted!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteCosti = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) return res.status(400).json({ message: "Bad request" });
    const cust = await prisma.costi.deleteMany({
      where: { id: { in: ids } },
    });
    if (!cust.count) return res.status(404).json({ message: "ids not found" });
    return res.status(200).json({ message: "costi deleted!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createBulkAttives = async (req, res) => {
  try {
    const { id } = req.user;
    const {attives} = req.body;

    if (!Array.isArray(attives) || attives.length === 0) {
      return res.status(400).json({ message: "No attives provided." });
    }

    const requiredFields = [
      "customerName",
      "vat",
      "name",
      "taxAmt",
      "docDate",
      "vatRate",
      "docNo",
      "typology",
      "yearOfCompetence",
      "protocol",
    ];

    const createdInvoices = [];

    for (const invoice of attives) {
      const missingField = requiredFields.find((field) => !invoice[field]);
      if (missingField) {
        return res.status(400).json({
          message: `Missing required field: ${missingField} in one of the attives.`,
        });
      }

      const exists = await prisma.invoice.findUnique({
        where: { docNo: invoice.docNo },
      });

      if (exists) {
        continue; // Skip existing invoice
      }

      

      const created = await prisma.invoice.create({
        data: {
          vat: invoice.vat,
          name: invoice.name,
          Processed: invoice.Processed,
          taxAmt: invoice.taxAmt,
          docDate: new Date(invoice.docDate),
          vatRate: invoice.vatRate,
          split: invoice.split,
          typology: invoice.typology,
          yearOfCompetence: invoice.yearOfCompetence,
          protocol: invoice.protocol,
          docNo: invoice.docNo,
          attachment: invoice?.filePath || null,
          admin: {
            connect: { id },
          },
          Customer: {
            connect: {
              companyName: invoice.customerName,
            },
          },
        },
      });

      createdInvoices.push(created);
    }

    return res.status(200).json({
      message: `${createdInvoices.length} attives created successfully.`,
      data: createdInvoices,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createBulkPassives = async (req, res) => {
  try {
    const { id } = req.user;
    const {passives} = req.body;

    if (!Array.isArray(passives) || passives.length === 0) {
      return res.status(400).json({ message: "No passives provided." });
    }

    const requiredFields = [
      "supplierName",
      "vat",
      "name",
      "taxAmt",
      "docDate",
      "vatRate",
      "docNo",
      "typology",
      "yearOfCompetence",
      "protocol",
    ];

    const createdInvoices = [];

    for (const invoice of passives) {
      const missingField = requiredFields.find((field) => !invoice[field]);
      if (missingField) {
        return res.status(400).json({
          message: `Missing required field: ${missingField} in one of the passives.`,
        });
      }

      const exists = await prisma.invoice.findUnique({
        where: { docNo: invoice.docNo },
      });

      if (exists) {
        continue; // Skip existing invoice
      }

      

      const created = await prisma.invoice.create({
        data: {
          vat: invoice.vat,
          name: invoice.name,
          Processed: invoice.Processed,
          taxAmt: invoice.taxAmt,
          docDate: new Date(invoice.docDate),
          vatRate: invoice.vatRate,
          type:"passive",
          split: invoice.split,
          typology: invoice.typology,
          yearOfCompetence: invoice.yearOfCompetence,
          protocol: invoice.protocol,
          docNo: invoice.docNo,
          attachment: invoice?.filePath || null,
          admin: {
            connect: { id },
          },
          supplier: {
            connect: {
              companyName: invoice.supplierName,
            },
          },
        },
      });

      createdInvoices.push(created);
    }

    return res.status(200).json({
      message: `${createdInvoices.length} passives created successfully.`,
      data: createdInvoices,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};