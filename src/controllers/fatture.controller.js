import prisma from "../../prisma/prisma.js";
import { cloudinaryUploader, formatDate } from "../lib/utils.js";

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
        type,
        Processed,
        taxAmt,
        docDate: new Date(docDate),
        vatRate,
        split,
        typology,
        type: "attive",
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
      type,
      Processed,
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
        type,
        Processed,
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

    return res.status(200).json({ message: "invoice created", fatture });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

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
      where: { id, type:"attive" },
      include: { Customer: { select: { companyName: true, account: {select:{cdp:true,date:true, see_CDP:true, wbs:true, order:{select:{description:true, workAmount:true}}}} } } },
      omit:{supplierId:true}
    });

    if (!activeFatture) {
      return res.status(404).json({ message: "not found" });
    }

    const { Customer, ...rest } = activeFatture;
    const allSals = Customer.account.flatMap(acc => acc.cdp);
    const cdpLength = allSals.length;

    
    const firstAccount = Customer.account[0];
    const description = firstAccount?.order?.description || null;
    const dateAcc = firstAccount?.date || null
    const result = {
      ...rest,
      cdpLength,
      ordDesc: description,
      accDate: formatDate(dateAcc),
      cdp: firstAccount.cdp,
      customerName: Customer?.companyName || null,
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
      where: { id, type:"passive" },
      include: { supplier: { select: { companyName: true, account: {select:{sal:true,progressive_SAL_amount:true,date:true, see_SAL:true, wbs:true, order:{select:{description:true, workAmount:true}}}} } } },
      omit:{customerId:true}
    });

    if (!passiveFatture) {
      return res.status(404).json({ message: "not found" });
    }
    
    const { supplier, ...rest } = passiveFatture;
    
    const allSals = supplier.account.flatMap(acc => acc.sal);
    const salLength = allSals.length;
    const totalAgreedCost = allSals.reduce((sum, sal) => sum + Number(sal.agreed || 0), 0);

    
    const firstAccount = supplier.account[0];
    const description = firstAccount?.order?.description || null;
    const dateAcc = firstAccount?.date || null ;
    const result = {
      ...rest,
      salLength,
      totalAgreedCost,
      supplierName: supplier.companyName || null,
      ordDesc: description,
      accDate: formatDate(dateAcc),
      sals: firstAccount.sal
    };
    return res.status(200).json({
      message: "found",
      data: result
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createRicavi = async (req, res) => {
  try {
    const {id} = req.user
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
    const already = await prisma.ricavi.findUnique({where:{docNo}})
    if(already) return res.status(400).json({message:"ricavi already exist"})
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
        admin:{
          connect: { id }
        },
        Customer: {
          connect: { companyName: customerName },
        },
      },
      include:{Customer:{select:{account:true}}}
    });
    return res.status(200).json({ message: "created!", data: ricavi });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCosti = async (req, res) => {
  const {id} = req.user
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
    const already = await prisma.costi.findUnique({where:{docNo}})
    if(already) return res.status(400).json({message:"costi already exist"})
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
        admin:{
          connect: { id }
        },
        supplier: {
          connect: { companyName: supplierName },
        },
      },
      include:{supplier:{select:{invoices:true}}}
    });
    return res.status(200).json({ message: "created!", data: costi });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const getAllRicavis = async (req, res)=> {
  try {
    const {id} = req.user
    let ricavis = await prisma.ricavi.findMany({where:{adminId:id},include:{Customer:{select:{companyName:true}}}})
    ricavis = ricavis.map((obj)=>({...obj, customerName:obj.Customer.companyName,docDate:formatDate(obj.docDate)})).map(({ Customer, ...rest }) => rest);
    return res.status(200).json({message:"fetched!", data:ricavis})
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}

export const getRicavi = async (req, res) => {
  try {
    const {id} = req.params
    const ricavi = await prisma.ricavi.findUnique({where:{id},include:{Customer:{select:{companyName:true,invoices:{select:{docNo:true}}}}}})
    return res.status(200).json({message:"fetched",data:{...ricavi,customerName:ricavi.Customer.companyName,docDate:formatDate(ricavi.docDate)}})
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}

export const getAllCostis = async (req, res)=> {
  try {
    const {id} = req.user
    let costis = await prisma.costi.findMany({where:{adminId:id},include:{supplier:{include:{invoices:{select:{docDate:true,docNo:true}}}}}})
    costis = costis.map((obj)=>({...obj,supplierName: obj.supplier.companyName,docDate:formatDate(obj.docDate)})).map(({ supplier, ...rest }) => rest);
    return res.status(200).json({message:"fetched!", data:costis})
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}

export const getCosti = async (req, res) => {
  try {
    const {id} = req.params
    const costi = await prisma.costi.findUnique({where:{id},include:{supplier:{select:{companyName:true,invoices:{select:{docNo:true}}}}}})
    return res.status(200).json({message:"fetched",data:{...costi,supplierName:costi.supplier.companyName,docDate:formatDate(costi.docDate)}})
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}

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
}