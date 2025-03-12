import prisma from "../../prisma/prisma.js";
import axios from "axios";
import { cloudinaryUploader } from "../lib/utils.js";

export const createOrder = async (req, res) => {
  try {
    const { id } = req.user;
    const { address, code, ...orderData } = req.body;

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
      "workAmount",
      "advancePayment",
      "dipositRecovery",
      "iva",
      "withholdingAmount",
    ];

    const missingField = requiredFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }

    const existingOrder = await prisma.order.findUnique({ where: { code } });
    if (existingOrder) {
      return res.status(400).json({ error: "Can't create duplicate orders" });
    }

    let location = null;
    try {
      const { data } = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        { params: { address, key: process.env.GOOGLE_API_KEY } }
      );
      location = data.results[0]?.geometry?.location || null;
    } catch (geoError) {
      return res
        .status(500)
        .json({ error: `Failed to fetch geolocation: ${geoError.message}` });
    }

    const uploadFields = ["contract", "permission_to_build", "psc", "pos"];
    const uploadedFiles = {};

    await Promise.all(
      uploadFields.map(async (field) => {
        if (req.files[field]?.[0]) {
          uploadedFiles[field] = await cloudinaryUploader(
            req.files[field][0].path
          );
        }
      })
    );

    const orderStateMap = {
      ON_HOLD: "In attesa",
      IN_PROGRESS: "In corso",
      CANCELLED: "Cancellato",
      COMPLETED: "Completato",
    };
    const order = await prisma.order.create({
      data: {
        ...orderData,
        code,
        address,
        contract: uploadedFiles.contract?.secure_url || null,
        permission_to_build:
          uploadedFiles.permission_to_build?.secure_url || null,
        psc: uploadedFiles.psc?.secure_url || null,
        pos: uploadedFiles.pos?.secure_url || null,
        adminId: id,
        lat: String(location?.lat) || null,
        lng: String(location?.lng) || null,
      },
    });

    return res.status(201).json({
      data: { ...order, state: orderStateMap[order.state] || order.state },
      message: "Order created successfully.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Order ID is required." });

    let location = null;
    if (req.body.address) {
      try {
        const { data } = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json`,
          {
            params: {
              address: req.body.address,
              key: process.env.GOOGLE_API_KEY,
            },
          }
        );
        location = data.results[0]?.geometry?.location || null;
      } catch (geoError) {
        return res
          .status(500)
          .json({ error: `Failed to fetch geolocation: ${geoError.message}` });
      }
    }
    let upd_data = {
      ...req.body,
      lat: String(location?.lat) || null,
      lng: String(location?.lng) || null,
    };
    const uploadFields = ["contract", "permission_to_build", "psc", "pos"];
    const uploadedFiles = {};

    await Promise.all(
      uploadFields.map(async (field) => {
        if (req.files[field]?.[0]) {
          uploadedFiles[field] = await cloudinaryUploader(
            req.files[field][0].path
          );
        }
      })
    );

    uploadFields.forEach((field) => {
      if (uploadedFiles[field]) {
        upd_data[field] = uploadedFiles[field]?.secure_url;
      }
    });
    const order = await prisma.order.update({
      where: { id },
      data: upd_data,
    });

    return res
      .status(200)
      .json({ data: order, message: "Order updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { id } = req.user;
    let { page } = req.query;
    page = parseInt(page, 10);
    if (isNaN(page) || page < 1) page = 1;
    const orders = await prisma.order.findMany({
      where: { adminId: id, archieved: "false" },
      skip: (page - 1) * 10,
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
    const orderStateMap = {
      ON_HOLD: "In attesa",
      IN_PROGRESS: "In corso",
      CANCELLED: "Cancellato",
      COMPLETATO: "Completato",
    }
    let order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    return res.status(200).json({...order,state: orderStateMap[order.state] || order.state});
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
    if (ord.count === 1)
      return res.status(200).json({ message: "Order deleted!" });
    return res.status(200).json({ message: "Orders deleted!" });
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

export const archieve = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Bad request" });

    const ord = await prisma.order.findUnique({
      where: { id },
    });
    if (!ord) return res.status(404).json({ message: "Order not found" });
    if (ord.archieved === "true") {
      await prisma.order.update({
        where: { id },
        data: { archieved: "false" },
      });
      return res.status(200).json({ message: "Order unarchieved!" });
    }

    await prisma.order.update({
      where: { id },
      data: { archieved: "true" },
    });
    return res.status(200).json({ message: "Order archieved!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getArchivedOrders = async (req, res) => {
  try {
    const { id } = req.user;
    let { page } = req.query;
    const orderStateMap = {
      ON_HOLD: "In attesa",
      IN_PROGRESS: "In corso",
      CANCELLED: "Cancellato",
      COMPLETATO: "Completato",
    };
    page = parseInt(page, 10);
    if (isNaN(page) || page < 1) page = 1;
    let orders = await prisma.order.findMany({
      where: { adminId: id, archieved: "true" },
      skip: (page - 1) * 10,
      take: 10,
    });
    if (!orders) return res.status(404).json({ message: "No archived orders" });
    orders = orders
       .map((order) => ({
      ...order,
      state: orderStateMap[order.state] || order.state,
    }));
    return res.status(200).json({ data: orders, message: "found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateOrderSequence = async (req, res) => {
  try {
    const { id } = req.user;
    const { addedColArray, visibleColArray } = req.body;
    if (!addedColArray || !visibleColArray) {
      return res.status(400).json({ error: "missing required fields" });
    }
    if (!Array.isArray(addedColArray) || !Array.isArray(visibleColArray))
      return res.status(406).json({ error: "Invalid type" });
    const reqOrdval = [
      "state",
      "description",
      "technicalManager",
      "siteManager",
      "address",
      "orderManager",
      "code",
      "startDate",
      "endDate",
      "cnceCode",
      "withholdingAmount",
      "workAmount",
      "advancePayment",
      "dipositRecovery",
      "isPublic",
      "iva",
      "cup",
      "cig",
      "actions",
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
    await prisma.ordSequence.upsert({
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

export const getOrderSequence = async (req, res) => {
  try {
    const { id } = req.user;
    const seq = await prisma.ordSequence.findUnique({ where: { adminId: id } });
    if (!seq) {
      return res.status(404).json({ message: "sequence not found" });
    }
    return res.status(200).json(seq);
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
