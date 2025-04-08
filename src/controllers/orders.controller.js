import prisma from "../../prisma/prisma.js";
import axios from "axios";
import { cloudinaryUploader, formatDate } from "../lib/utils.js";

export const createOrder = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      address,
      code,
      customerName,
      withholdingAmount,
      workAmount,
      dipositRecovery,
      iva,
      startDate,
      endDate,
      advancePayment,
      desc_psc,
      desc_pos,
      desc_permission_to_build,
      desc_contract,
      ...orderData
    } = req.body;

    const requiredFields = [
      "code",
      "description",
      "address",
      "siteManager",
      "orderManager",
      "technicalManager",
      "workAmount",
      "customerName",
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
    if (startDate && endDate) {
      const dataRilascio = new Date(startDate);
      const expiryDate = new Date(endDate);
      if (dataRilascio > expiryDate) {
        return res.status(400).json({
          message: "Invalid dates: dataRilascio cannot be greater than expiryDate",
        });
      }
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
    const descAttachmentPairs = [
      { desc: desc_psc, file: uploadedFiles.psc, name: "PSC" },
      { desc: desc_pos, file: uploadedFiles.pos, name: "POS" },
      { desc: desc_permission_to_build, file: uploadedFiles.permission_to_build, name: "Permission to Build" },
      { desc: desc_contract, file: uploadedFiles.contract, name: "Contract" }
    ];
    
    for (const { desc, file, name } of descAttachmentPairs) {
      if (desc && !file) {
        return res.status(400).json({
          message: `You provided a description for ${name} without uploading the corresponding attachment.`,
        });
      }
    
      if (!desc && file) {
        return res.status(400).json({
          message: `You uploaded a file for ${name} without providing a description.`,
        });
      }
    }
    const orderStateMap = {
      ON_HOLD: "In attesa",
      IN_PROGRESS: "In corso",
      CANCELLED: "Cancellato",
      COMPLETATO: "Completato",
    };
    let order;
    try {
      order = await prisma.order.create({
        data: {
          ...orderData,
          withholdingAmount: Number(withholdingAmount),
          iva: Number(iva),
          dipositRecovery: Number(dipositRecovery),
          workAmount: Number(workAmount),
          advancePayment: Number(advancePayment),
          endDate: new Date(endDate).toISOString(),
          startDate: new Date(startDate).toISOString(),
          code,
          address,
          contract: uploadedFiles.contract?.secure_url || null,
          permission_to_build:
            uploadedFiles.permission_to_build?.secure_url || null,
          psc: uploadedFiles.psc?.secure_url || null,
          pos: uploadedFiles.pos?.secure_url || null,
          desc_psc,
          desc_pos,
          desc_permission_to_build,
          desc_contract,
          admin: {
            connect: { id },
          },
          lat: String(location?.lat) || null,
          lng: String(location?.lng) || null,
          Customer: {
            connect: { companyName: customerName },
          }
        },
      });
    } catch (prismaError) {
      if (prismaError.code === "P2025") {
        return res.status(400).json({
          error: "Invalid reference",
          details:
            "Customer, Supplier, or one of the managers does not exist. Please check the provided names",
        });
      }
      return res.status(500).json({ error: prismaError.message });
    }

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
    const {
      customerName,
      address,
      adminId,
      withholdingAmount,
      workAmount,
      dipositRecovery,
      desc_psc,
      desc_pos,
      desc_permission_to_build,
      desc_contract,
      iva,
      startDate,
      endDate,
      advancePayment,
      ...rest
    } = req.body;
    if (!id) return res.status(400).json({ message: "Order ID is required." });
    if (startDate && endDate) {
      const dataRilascio = new Date(startDate);
      const expiryDate = new Date(endDate);
    
      if (dataRilascio > expiryDate) {
        return res.status(400).json({
          message: "Invalid dates: dataRilascio cannot be greater than expiryDate",
        });
      }
    }
    let location = null;
    if (address) {
      try {
        const { data } = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json`,
          {
            params: {
              address: address,
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
      ...rest,
      address,
      ...(address &&
        location && { lat: String(location.lat), lng: String(location.lng) }),
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
    if (
      (desc_psc && !uploadedFiles.psc) ||
      (desc_pos && !uploadedFiles.pos) ||
      (desc_permission_to_build && !uploadedFiles.permission_to_build) ||
      (desc_contract && !uploadedFiles.contract)
    ) {
      return res.status(400).json({
        message: "Descriptions aren't provided without attachments",
      });
    }
    uploadFields.forEach((field) => {
      if (uploadedFiles[field]) {
        upd_data[field] = uploadedFiles[field]?.secure_url;
      }
    });
    const orderStateMap = {
      ON_HOLD: "In attesa",
      IN_PROGRESS: "In corso",
      CANCELLED: "Cancellato",
      COMPLETATO: "Completato",
    };
    const updateData = {
      ...upd_data,
      ...(customerName
        ? {
            Customer: {
              connect: { companyName: customerName },
            },
          }
        : {}),

      ...(withholdingAmount !== undefined && {
        withholdingAmount: Number(withholdingAmount),
      }),
      ...(iva !== undefined && { iva: Number(iva) }),
      ...(dipositRecovery !== undefined && {
        dipositRecovery: Number(dipositRecovery),
      }),
      ...(workAmount !== undefined && { workAmount: Number(workAmount) }),
      ...(advancePayment !== undefined && {
        advancePayment: Number(advancePayment),
      }),
      ...(startDate && { startDate: new Date(startDate).toISOString() }),
      ...(endDate && { endDate: new Date(endDate).toISOString() }),
    };
    delete updateData.supplierId
    delete updateData.customerId
    delete updateData.adminId
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      data: { ...order, state: orderStateMap[order.state] || order.state },
      message: "Order updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { id } = req.user;
    const orderStateMap = {
      ON_HOLD: "In attesa",
      IN_PROGRESS: "In corso",
      CANCELLED: "Cancellato",
      COMPLETATO: "Completato",
    };
    let { page } = req.query;
    page = parseInt(page, 10);
    if (isNaN(page) || page < 1) page = 1;
    let orders = await prisma.order.findMany({
      where: { adminId: id, archieved: "false" },
      skip: (page - 1) * 10,
      take: 10,
    });
    if (!orders) {
      return res.status(200).json({ message: "No current orders", data: [] });
    }
    orders = orders.map((order) => ({
      ...order,
      state: orderStateMap[order.state] || order.state,
      startDate: new Date(order.startDate).toLocaleDateString(),
      endDate: new Date(order.endDate).toLocaleDateString(),
      advancePayment: Number(order.advancePayment).toFixed(2),
      withholdingAmount: Number(order.withholdingAmount).toFixed(2),
      workAmount: Number(order.workAmount).toFixed(2),
      dipositRecovery: Number(order.dipositRecovery).toFixed(2),
      iva: Number(order.iva).toFixed(2),
    }));
    return res.status(200).json({
      message: "All orders fetched",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const recentOrders = async (req, res) => {
  try {
    const { id } = req.user;
    const orderStateMap = {
      ON_HOLD: "In attesa",
      IN_PROGRESS: "In corso",
      CANCELLED: "Cancellato",
      COMPLETATO: "Completato",
    };
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    let RecentOrders = await prisma.order.findMany({
      where: {
        adminId: id,
        archieved: "false",
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
      take: 10,
    });
    if (!RecentOrders) {
      return res.status(400).json({ message: "No Recent Orders" });
    }
    RecentOrders = RecentOrders.map((order) => ({
      ...order,
      state: orderStateMap[order.state] || order.state,
      startDate: new Date(order.startDate).toLocaleDateString(),
      endDate: new Date(order.endDate).toLocaleDateString(),
      advancePayment: Number(order.advancePayment).toFixed(2),
      withholdingAmount: Number(order.withholdingAmount).toFixed(2),
      workAmount: Number(order.workAmount).toFixed(2),
      dipositRecovery: Number(order.dipositRecovery).toFixed(2),
      iva: Number(order.iva).toFixed(2),
    }));
    return res.status(200).json({
      message: "All Recent Orders fetched",
      data: RecentOrders,
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
    };
    let order = await prisma.order.findUnique({
      where: { id },
      include: { Customer: true, supplier: true, decs_ },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    return res
      .status(200)
      .json({
        ...order,
        state: orderStateMap[order.state] || order.state,
        startDate: formatDate(order.startDate),
        endDate: formatDate(order.endDate),
        advancePayment: Number(order.advancePayment).toFixed(2),
        withholdingAmount: Number(order.withholdingAmount).toFixed(2),
        workAmount: Number(order.workAmount).toFixed(2),
        dipositRecovery: Number(order.dipositRecovery).toFixed(2),
        iva: Number(order.iva).toFixed(2),
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createOrders = async (req, res) => {
  try {
    const { id } = req.user;
    const { orders } = req.body;
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res
        .status(400)
        .json({ message: "Bad Request: Orders are required" });
    }

    const requiredFields = [
      "code",
      "description",
      "address",
      "siteManager",
      "orderManager",
      "technicalManager",
      "workAmount",
      "customerName",
    ];

    for (const order of orders) {
      const missingFields = requiredFields.filter((field) => !order[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `An order is missing required fields: ${missingFields.join(
            ", "
          )}`,
        });
      }
      if (order?.startDate && order?.endDate) {
        const dataRilascio = new Date(order.startDate);
        const expiryDate = new Date(order.endDate);
      
        if (dataRilascio > expiryDate) {
          return res.status(400).json({
            message: `Invalid dates: dataRilascio cannot be greater than expiryDate for ${order.code}`,
          });
        }
      }
    }
    const managerNames = [
      ...new Set(
        orders.flatMap((order) => [
          order.orderManager,
          order.siteManager,
          order.technicalManager,
        ])
      ),
    ];

    const [existingOrders, employees] = await Promise.all([
      prisma.order.findMany({
        where: { code: { in: orders.map((order) => order.code) } },
        select: { code: true },
      }),
      prisma.employee.findMany({
        where: { nameAndsurname: { in: managerNames } },
        select: { nameAndsurname: true },
      }),
    ]);

    const existingOrderCodes = new Set(
      existingOrders.map((order) => order.code)
    );
    const validManagers = new Set(employees.map((emp) => emp.nameAndsurname));

    const invalidReferences = orders.filter((order) => {
      return (
        !validManagers.has(order.orderManager) ||
        !validManagers.has(order.siteManager) ||
        !validManagers.has(order.technicalManager)
      );
    });

    if (invalidReferences.length > 0) {
      return res.status(400).json({
        message:
          "Invalid references found for orderManager, siteManager, technicalManager",
        invalidReferences,
      });
    }

    const uniqueOrders = orders.filter(
      (order) => !existingOrderCodes.has(order.code)
    );

    const createdOrders = await Promise.all(
      uniqueOrders.map(async (order) => {
        const customer = await prisma.customer.findUnique({
          where: { companyName: order.customerName },
          select: { id: true },
        });

        if (!customer) {
          return res
            .status(400)
            .json({
              error: `Invalid customer: ${order.customerName} for order: ${order.code}`,
            });
        }

        return await prisma.order.create({
          data: {
            admin: { connect: { id } },
            code: order.code,
            description: order.description,
            startDate: order?.startDate ? new Date(order.startDate).toISOString() : null,
            endDate: order?.endDate ? new Date(order.endDate).toISOString() : null,
            address: order.address,
            cig: order?.cig,
            cup: order?.cup,
            siteManager: order.siteManager,
            orderManager: order.orderManager,
            technicalManager: order.technicalManager,
            cnceCode: order?.cnceCode,
            workAmount: Number(order.workAmount),
            advancePayment: Number(order.advancePayment),
            dipositRecovery: Number(order?.dipositRecovery),
            iva: Number(order?.iva),
            withholdingAmount: Number(order?.withholdingAmount),
            isPublic: order.isPublic === "true" ? "true" : "false",
            pos: order?.pos,
            psc: order?.psc,
            permission_to_build: order?.permission_to_build,
            contract: order?.contract,
            Customer: { connect: { id: customer.id } },
            supplier: { connect: { id: supplier.id } },
          },
        });
      })
    );
    if(!createdOrders.length) return res.status(400).json({message:"Orders already exists"})
    return res.status(200).json({
      message: `Orders added: ${createdOrders.length}, Skipped duplicates: ${
        orders.length - uniqueOrders.length
      }`,
      skippedOrders: Array.from(existingOrderCodes),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAssociatedUsers = async (req, res) => {
  try {
    const { id } = req.user;
    const users = await prisma.admin.findUnique({
      where: { id },
      select: {
        clients: {
          select: {
            companyName: true,
          },
        },
        suppliers: {
          select: {
            companyName: true,
          },
        },
        employees: {
          select: {
            name: true,
            surname: true,
          },
        },
      },
    });
    
    return res.status(200).json(users);
  } catch (error) {
    return res.status(200).json({ error: error.message });
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
      include: {
        Customer: { select: { companyName: true } },
        supplier: { select: { companyName: true } },
      },
      take: 10,
    });
    if (!orders) return res.status(404).json({ message: "No archived orders" });
    orders = orders
      .map((order) => ({
        ...order,
        state: orderStateMap[order.state] || order.state,
        startDate: formatDate(order.startDate),
        endDate: formatDate(order.startDate),
        advancePayment: Number(order.advancePayment).toFixed(2)+"€",
        withholdingAmount: Number(order.withholdingAmount).toFixed(2)+"%",
        workAmount: Number(order.workAmount).toFixed(2)+"€",
        dipositRecovery: Number(order.dipositRecovery).toFixed(2)+"%",
        iva: Number(order.iva).toFixed(2)+"%",
        customerName: order.Customer?.companyName || null,
        supplierName: order.supplier?.companyName || null,
      }))
      .map(({ Customer, supplier, ...rest }) => rest);
    return res.status(200).json({ data: orders, message: "found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateOrderSequence = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      addedColArray,
      visibleColArray,
      archiveAddedColArray,
      archiveVisibleColArray,
    } = req.body;

    if (
      (addedColArray && !visibleColArray) ||
      (!addedColArray && visibleColArray)
    ) {
      return res.status(400).json({
        error: "addedColArray and visibleColArray must be provided together.",
      });
    }

    if (
      (archiveAddedColArray && !archiveVisibleColArray) ||
      (!archiveAddedColArray && archiveVisibleColArray)
    ) {
      return res.status(400).json({
        error:
          "archiveAddedColArray and archiveVisibleColArray must be provided together.",
      });
    }

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
      "customerName",
      "isPublic",
      "iva",
      "cup",
      "cig",
      "actions",
    ];
    const invalidFields = [
      ...(addedColArray || []).filter((field) => !reqOrdval.includes(field)),
      ...(visibleColArray || []).filter((field) => !reqOrdval.includes(field)),
      ...(archiveAddedColArray || []).filter(
        (field) => !reqOrdval.includes(field)
      ),
      ...(archiveVisibleColArray || []).filter(
        (field) => !reqOrdval.includes(field)
      ),
    ];

    if (invalidFields.length > 0) {
      return res
        .status(422)
        .json({ error: `Invalid fields found: ${invalidFields.join(", ")}` });
    }

    const updateData = {};

    if (addedColArray) {
      updateData.added_col_array = addedColArray;
    }
    if (visibleColArray) {
      updateData.visible_col_array = visibleColArray;
    }
    if (archiveAddedColArray) {
      updateData.archive_added_col_array = archiveAddedColArray;
    }
    if (archiveVisibleColArray) {
      updateData.archive_visible_col_array = archiveVisibleColArray;
    }

    await prisma.ordSequence.upsert({
      where: { adminId: id },
      update: updateData,
      create: {
        added_col_array: addedColArray || [],
        visible_col_array: visibleColArray || [],
        archive_added_col_array: archiveAddedColArray || [],
        archive_visible_col_array: archiveVisibleColArray || [],
        adminId: id,
      },
    });

    return res.status(200).json({ message: "Sequence updated!" });
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
