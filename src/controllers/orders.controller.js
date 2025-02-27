import prisma from "../../prisma/prisma.js";
import csv from "csv-parser";
import fs from "fs";
import { Parser } from "json2csv";
import axios from "axios";
import { error } from "console";
import { cloudinaryUploader } from "../lib/utils.js";

export const createOrder = async (req, res) => {
  try {
    const { id } = req.user;
    // const res = await axios.get(
    //   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    //     req.body.address
    //   )}&key=${process.env.GOOGLE_API_KEY}`
    // );
    // const location = geoResponse.data.results[0]?.geometry.location || null;

    const requiredFields = [
      "code",
      "description",
      "startDate",
      "endDate",
      "address",
      "cig",
      "cup",
      "siteManager",
      "orderManager",
      "technicalManager",
      "cnceCode",
      "isPublic",
      "workAmount",
      "advancePayment",
      "dipositRecovery",
      "iva",
      "withholdingAmount",
    ];
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(404).json({
          message: `Missing required field: ${field}`,
        });
      }
    }
    const ifExist = await prisma.order.findUnique({
      where: { code: req.body.code },
    });
    if (ifExist)
      return res.status(400).json({ error: "Can't create duplicate orders" });
    const uploadedFiles = {};
    for (const field of ["contract", "permission_to_build", "psc", "pos"]) {
      if (req.files[field] && req.files[field][0]) {
        uploadedFiles[field] = await cloudinaryUploader(
          req.files[field][0]?.path
        );
      }
    }
    const order = await prisma.order.create({
      data: {
        ...req.body,
        isPublic: req.body.isPublic === "true",
        contract: uploadedFiles.contract?.secure_url,
        permission_to_build: uploadedFiles.permission_to_build?.secure_url,
        psc: uploadedFiles.psc?.secure_url,
        pos: uploadedFiles.pos?.secure_url,
        adminId: id,
        // lat: location?.lat,
        // lng: location?.lng,
      },
    });
    return res.status(200).json({
      data: order,
      message: "order created successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(401).json({ message: "id not found" });
    const upd_data = { ...req.body };
    const uploadedFiles = {};
    for (const field of ["contract", "permission_to_build", "psc", "pos"]) {
      if (req.files[field] && req.files[field][0]) {
        uploadedFiles[field] = await cloudinaryUploader(
          req.files[field][0]?.path
        );
      }
      return res.status(400).json({message:"Bad request"})
    }
    if (
      uploadedFiles.contract ||
      uploadedFiles.permission_to_build ||
      uploadedFiles.pos ||
      uploadedFiles.psc
    ) {
      upd_data.contract = uploadedFiles.contract?.secure_url;
      upd_data.permission_to_build = uploadedFiles.permission_to_build?.secure_url;
      upd_data.pos = uploadedFiles.pos?.secure_url;
      upd_data.psc = uploadedFiles.psc?.secure_url;
    }
    const order = await prisma.order.update({
      where: { id: id },
      data: {...upd_data, isPublic: req.body?.isPublic === 'true'},
    });
    return res
      .status(200)
      .json({ data: order, message: "updated succesfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { id } = req.user;
    const orders = await prisma.order.findMany({
      where: { adminId: id, archieved: false },
      take: 10,
    });
    if (!orders) {
      return res.status(200).json({ message: "No current orders", data: [] });
    }
    return res.status(200).json({
      message: "All orders fetched",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id: id } });
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) return res.status(400).json({ message: "Bad request" });
    const ord = await prisma.order.deleteMany({ where: { id: { in: ids } } });
    if (!ord.count) return res.status(404).json({ message: "ids not found" });
    return res.status(200).json({ message: "Order deleted!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const searchOrder = async (req, res) => {
  try {
    const { code } = req.query;
    const order = await prisma.order.findMany({
      where: { code: { contains: code, mode: "insensitive" } },
    });
    if (!order) return res.status(404).json({ message: "not found" });
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const archieveOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Bad request" });
    const ord = await prisma.order.update({
      where: { id: id },
      data: { archieved: true },
    });
    if (!ord) return res.status(404).json({ message: "Order not found" });
    return res.status(200).json({ message: "Order archieved!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getArchivedOrders = async (req, res) => {
  try {
    const { id } = req.user;
    const orders = await prisma.order.findMany({
      where: { adminId: id, archieved: true },
    });
    if (!orders) return res.status(404).json({ message: "No archived orders" });
    return res.status(200).json({ data: orders, message: "found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// export const importCSV = async (req, res) => {
//   try {
//     const { service } = req.query;
//     if (!service)
//       return res.status(401).json({ message: "Missing service field" });
//     const orders = [];
//     const client = [];
//     const supplier = [];
//     switch (service) {
//       case "order":
//         fs.createReadStream(req.file.path)
//           .pipe(csv())
//           .on("data", (data) => orders.push(data))
//           .on("end", async () => {
//             const ans = await prisma.order.createMany({ data: orders });
//             res.json({
//               message: "CSV Imported Successfully in orders",
//               data: ans,
//             });
//           });
//         break;
//       case "customer":
//         fs.createReadStream(req.file.path)
//           .pipe(csv())
//           .on("data", (data) => client.push(data))
//           .on("end", async () => {
//             const ans = await prisma.customer.createMany({ data: orders });
//             res.json({
//               message: "CSV Imported Successfully in customer",
//               data: ans,
//             });
//           });
//         break;
//       case "supplier":
//         fs.createReadStream(req.file.path)
//           .pipe(csv())
//           .on("data", (data) => supplier.push(data))
//           .on("end", async () => {
//             const ans = await prisma.supplier.createMany({ data: orders });
//             res.json({
//               message: "CSV Imported Successfully in supplier",
//               data: ans,
//             });
//           });
//         break;
//       default:
//         return res.status(400).json({ message: "Invalid service" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const exportCSV = async (req, res) => {
//   try {
//     let formattedData;
//     const { service } = req.query;
//     if (!service)
//       return res.status(401).json({ message: "Missing service field" });
//     switch (service) {
//       case "order":
//         const orders = await prisma.order.findMany();

//         if (!orders.length) {
//           return res.status(404).json({ message: "No orders found" });
//         }
//         formattedData = orders.map((order) => ({
//           ...order,
//           createdAt: formatDate(order.createdAt),
//           updatedAt: formatDate(order.updatedAt),
//         }));
//         break;
//       case "customer":
//         const clients = await prisma.customer.findMany();
//         if (!clients.length) {
//           return res.status(404).json({ message: "No clients found" });
//         }
//         formattedData = clients.map((order) => ({
//           ...order,
//           createdAt: formatDate(order.createdAt),
//           updatedAt: formatDate(order.updatedAt),
//         }));
//         break;
//       case "supplier":
//         const suppliers = await prisma.supplier.findMany();
//         if (!suppliers.length) {
//           return res.status(404).json({ message: "No supplier found" });
//         }
//         formattedData = suppliers.map((order) => ({
//           ...order,
//           createdAt: formatDate(order.createdAt),
//           updatedAt: formatDate(order.updatedAt),
//         }));
//         break;
//       default:
//         return res.status(400).json({ message: "Invalid service" });
//     }

//     const keys = Array.from(new Set(formattedData.flatMap(Object.keys)));
//     const transformedData = formattedData.map((order, index) => {
//       return keys.reduce((acc, key) => {
//         acc["Order"] = `${index + 1}`;
//         acc[key] = order[key] !== null ? order[key] : "";
//         return acc;
//       }, {});
//     });

//     const json2csvParser = new Parser({ fields: ["Order", ...keys] });
//     const csvData = json2csvParser.parse(transformedData);

//     res.setHeader("Content-Type", "text/csv");
//     res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
//     res.status(200).send(csvData);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
