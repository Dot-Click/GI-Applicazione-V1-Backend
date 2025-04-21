import prisma from "../../prisma/prisma.js";
import { cloudinaryUploader, formatDate } from "../lib/utils.js";

const AccRoles = {
  Approvato: "Approvato",
  Da_approvare: "Da approvare",
  Non_approvata: "Non approvata",
};

export const createAccountWithSupplier = async (req, res) => {
  try {
    const { id: adminId } = req.user;
    const { suppCode, date, ordCode, code, SAL } = req.body;
    const reqFields = ["suppCode", "date", "ordCode", "SAL"];
    const missingField = reqFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }
    const [exist] = await Promise.allSettled([
      prisma.accounts.findUnique({where:{code}})
    ])
    if(exist){
      console.log(exist)
      return res.status(400).json({message:"can't create duplicate accounts"})
    }
    const invoice = JSON.parse(SAL);

    for (let index = 0; index < invoice.length; index++) {
      const item = invoice[index];
      const requiredInvoiceFields = [
        "total",
        "discounts",
        "roundingDiscount",
        "agreed",
        "sect",  // an array of invoice section
      ];
      const missingFields = requiredInvoiceFields.filter(
        (field) => item[field] === undefined
      );
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required fields in invoice item: ${missingFields.join(
            ", "
          )}`,
        });
      }

      if (!Array.isArray(item.sect)) {
        return res.status(400).json({
          message: `Field 'sect' must be an array in invoice`,
        });
      }

      for (let sectIndex = 0; sectIndex < item.sect.length; sectIndex++) {
        const section = item.sect[sectIndex];
        if (!section.title || !Array.isArray(section.salData)) {
          return res.status(400).json({
            message: `Each 'sect' must have a 'title' and 'salData'`,
          });
        }

        for (
          let dataIndex = 0;
          dataIndex < section.salData.length;
          dataIndex++
        ) {
          const data = section.salData[dataIndex];
          const salDataFields = [
            "description",
            "unitOfMeasures",
            "eqlParts",
            "lun",
            "lar",
            "alt",
            "quantity",
            "price",
            "amount", // current sal ammount of every invoice
          ];
          const missingDataFields = salDataFields.filter(
            (field) => data[field] === undefined
          );
          if (missingDataFields.length > 0) {
            return res.status(400).json({
              message: `Missing fields in salData: ${missingDataFields.join(
                ", "
              )}`,
            });
          }
        }
      }
    }

    const files = req.files;
    const uploadFields = [
      "add_additional_1",
      "add_additional_2",
      "add_additional_3",
    ];

    const uploadedFiles = {};

    await Promise.all(
      uploadFields.map(async (field) => {
        if (files?.[field]?.[0]) {
          const cloudUrl = await cloudinaryUploader(files[field][0].path);
          uploadedFiles[field] = cloudUrl.secure_url || null;
        }
      })
    );

    const [firstMatch, secondMatch]=await Promise.all([
      prisma.accounts.findUnique({
        where: { suppCode_ordCode:{suppCode, ordCode}, code },
      }),
      prisma.accounts.findUnique({
        where: { suppCode_ordCode:{ordCode, suppCode}, code },
      })
    ]);
    if (firstMatch || secondMatch) {
      return res.status(400).json({
        message: "Supplier & Order already linked to another account.",
      });
    }

    const account = await prisma.accounts.upsert({
      where: {
        suppCode_ordCode:{
          ordCode,
          suppCode,
        }
      },
      update: {
        sal: {
          create: invoice.map((salItem) => ({
            ...salItem,
            add_additional_1: uploadedFiles.add_additional_1,
            add_additional_2: uploadedFiles.add_additional_2,
            add_additional_3: uploadedFiles.add_additional_3,
            sect: {
              create: salItem.sect.map((sect) => ({
                title: sect.title,
                salData: {
                  create: sect.salData.map((data) => ({
                    ...data,
                  })),
                },
              })),
            },
          })),
        },
      },
      create: {
        suppCode,
        code,
        ordCode,
        adminId,
        date: new Date(date),
        sal: {
          create: invoice.map((salItem) => ({
            ...salItem,
            add_additional_1: uploadedFiles.add_additional_1,
            add_additional_2: uploadedFiles.add_additional_2,
            add_additional_3: uploadedFiles.add_additional_3,
            sect: {
              create: salItem.sect.map((sect) => ({
                title: sect.title,
                salData: {
                  create: sect.salData.map((data) => ({
                    ...data,
                  })),
                },
              })),
            },
          })),
        },
      },
      include: { sal: { include: { sect: { include: { salData: true } } } } },
    });

    res.status(201).json({ message: "Account and invoice created", account });
  } catch (error) {
    console.error("Error creating account with invoice:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// export const getAccountWithOrder = async (req, res) => {
//   try {
//     const {ordCode} = req.body
//     const acc = await prisma.accounts.findFirst({where:{ordCode}, include:{order:{select:{description:true}},sal:{include:{sect:{include:{salData:true}}}}}})
//     if (!acc) return res.status(404).json({ message: "Account not found" });
//     const {
//       order,
//       supplier,
//       sal,
//       status,
//       ...rest
//     } = acc;

//     const transformed = {
//       ...rest,
//       status: AccRoles[status] || status,
//       order_desc: order?.description,
//       supplier_name: supplier?.companyName,
//       total_sal: sal?.length,
//       sal, // keep full sal if needed
//     };
//     return res.status(200).json({message:"fetched",data:transformed})
//   } catch (error) {
//     return res.status(500).json({message: error.message})
//   }
// }
export const getAccountWithOrder = async (req, res) => {
  try {
    const { ordCode } = req.body;

    // Try fetching the account first
    const acc = await prisma.accounts.findFirst({
      where: { ordCode },
      include: {
        supplier: { select: { companyName: true } },
        order: { select: { description: true } },
        sal: {
          include: {
            sect: {
              include: { salData: true },
            },
          },
        },
      },
    });

    // If account doesn't exist, fetch order info separately
    if (!acc) {
      const order = await prisma.order.findUnique({
        where: { code: ordCode },
        select: { description: true },
      });

      return res.status(200).json({
        message: "Account not found, returning initial values",
        data: {
          ordCode,
          order_desc: order?.description || "No description",
          status: AccRoles["Da_approvare"],
          supplier_name: "",
          total_sal: 0,
          sal: [],
        },
      });
    }

    // Transform account data if found
    const { order, supplier, sal, status, ...rest } = acc;

    const transformed = {
      ...rest,
      order_desc: order?.description || "",
      supplier_name: supplier?.companyName || "",
      status: AccRoles[status] || status,
      date: formatDate(acc.date),
      total_sal: sal.length,
      sal,
    };

    return res.status(200).json({ message: "fetched", data: transformed });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateAccountWithSupplier = async (req, res) => {
  try {
    const { id: adminId } = req.user;
    const { id } = req.params;
    const { see_SAL, suppCode, ordCode, date, status, SAL } = req.body;
    if (!id) return res.status(400).json({ message: "Missing account id" });
    console.log(date)
    const account = await prisma.accounts.findUnique({ where: { id } });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const files = req.files;
    const uploadFields = [
      "add_additional_1",
      "add_additional_2",
      "add_additional_3",
    ];
    const uploadedFiles = {};

    await Promise.all(
      uploadFields.map(async (field) => {
        if (files?.[field]?.[0]) {
          const cloudUrl = await cloudinaryUploader(files[field][0].path);
          uploadedFiles[field] = cloudUrl.secure_url || null;
        }
      })
    );

    const updateData = {
      adminId,
      suppCode: suppCode ?? account.suppCode,
      see_SAL: see_SAL ?? account.see_SAL,
      status: status ?? account.status,
      ordCode: ordCode ?? account.ordCode,
      date: date ? new Date(date) : account.date,
    };
    if (!SAL && Object.keys(uploadedFiles).length > 0) {
      return res
        .status(400)
        .json({
          message: "Invalid request attachments must came with invoice",
        });
    }
    if (SAL) {
      const invoices = JSON.parse(SAL);

      for (const updatedSAL of invoices) {
        const existingSAL = await prisma.sAL.findUnique({
          where: { id: updatedSAL.id },
          include: { sect: { include: { salData: true } } },
        });

        if (!existingSAL) continue;

        for (const updatedSect of updatedSAL.sect || []) {
          const existingSect = existingSAL.sect.find(
            (sec) => sec.id === updatedSect.id
          );
          if (!existingSect) continue;

          for (const updatedSalData of updatedSect.salData || []) {
            const existingSalData = existingSect.salData.find(
              (sd) => sd.id === updatedSalData.id
            );
            if (!existingSalData) continue;

            await prisma.salData.update({
              where: { id: updatedSalData.id },
              data: {
                ...updatedSalData,
              },
            });
          }

          await prisma.sALsect.update({
            where: { id: updatedSect.id },
            data: {
              title: updatedSect.title,
            },
          });
        }

        await prisma.sAL.update({
          where: { id: updatedSAL.id },
          data: {
            total: updatedSAL.total,
            discounts: updatedSAL.discounts,
            roundingDiscount: updatedSAL.roundingDiscount,
            agreed: updatedSAL.agreed,
          },
        });
        if (Object.keys(uploadedFiles).length > 0) {
          await prisma.sAL.updateMany({
            where: { id: updatedSAL.id },
            data: {
              ...(uploadedFiles.add_additional_1 && {
                add_additional_1: uploadedFiles.add_additional_1,
              }),
              ...(uploadedFiles.add_additional_2 && {
                add_additional_2: uploadedFiles.add_additional_2,
              }),
              ...(uploadedFiles.add_additional_3 && {
                add_additional_3: uploadedFiles.add_additional_3,
              }),
            },
          });
        }
      }
    }

    delete updateData?.code;
    const updated = await prisma.accounts.update({
      where: { id },
      data: updateData,
      include: {
        sal: { include: { sect: { include: { salData: true } } } },
      },
    });

    return res.status(200).json({
      message: "Account updated",
      data: {
        ...updated,
        status: AccRoles[updated.status] || updated.status,
        date: formatDate(updateData.date),
      },
    });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const getAllAccountWithSuppliers = async (req, res) => {
  try {
    const { id: adminId } = req.user;
    let acc = await prisma.accounts.findMany({
      where: { adminId },
      include: {
        supplier: true,
        order: true,
        sal: {
          include: {
            sect: {
              include: {
                salData: true,
              },
            },
          },
        },
      },
    });
    acc = acc
      .map((item) => ({
        ...item,
        status: AccRoles[item.status] || item.status,
        date: formatDate(item.date),
        supplierName: item.supplier.companyName,
        ordDesc: item.order.description,
        total_sal: item.sal.length,
      }))
      .map(({ sal, supplier, order, ...rest }) => rest);
    return res
      .status(200)
      .json({ message: "account with suppliers fetched", data: acc });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAccountWithSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    let account = await prisma.accounts.findUnique({
      where: { id },
      include: {
        sal: {
          include: {
            sect: {
              include: {
                salData: true,
              },
            },
          },
        },
      },
    });
    if (!account) return res.status(404).json({ message: "Not found" });
    return res.status(200).json({
      message: "found",
      data: {
        ...account,
        date: formatDate(account.date),
        status: AccRoles[account.status] || account.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAccounts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) return res.status(404).json({ message: "missing ids field" });

    const acc = await prisma.accounts.deleteMany({
      where: { id: { in: ids } },
    });
    if (!acc.count) return res.status(404).json({ message: "ids not found" });
    return res.status(200).json({ message: "deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
};
