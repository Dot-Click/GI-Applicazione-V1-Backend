import prisma from "../../prisma/prisma.js";
import { cloudinaryUploader, formatDate, formatDatePost, formatNumberWithThousands } from "../lib/utils.js";

const AccRoles = {
  Approvato: "Approvato",
  Da_approvare: "Da approvare",
  Non_approvata: "Non approvata",
};

const fileUploadOfSalAttach = async (sal_id, uploadedFiles) => {
  try {
    const sal = await prisma.sAL.update({
      where: { id: sal_id },
      data: uploadedFiles,
    });
    return sal;
  } catch (error) {
    throw new Error(error.message);
  }
};
const fileUploadOfCdpAttach = async (cdp_id, uploadedFiles) => {
  try {
    const sal = await prisma.cDP.update({
      where: { id: cdp_id },
      data: uploadedFiles,
    });
    return sal;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const createAccountWithSupplier = async (req, res) => {
  try {
    const { id: adminId } = req.user;
    const { suppCode, date, ordCode,wbs, code, SAL } = req.body;

    const requiredFields = ["suppCode", "date", "ordCode", "SAL","code","wbs"];
    const missingField = requiredFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }

    const invoice = JSON.parse(SAL);

    for (const item of invoice) {
      const requiredInvoiceFields = ["total", "discounts", "roundingDiscount", "agreed", "sect"];
      const missingFields = requiredInvoiceFields.filter(field => item[field] === undefined);
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required fields in invoice: ${missingFields.join(", ")}`,
        });
      }

      if (!Array.isArray(item.sect)) {
        return res.status(400).json({ message: `'sect' must be an array` });
      }

      for (const section of item.sect) {
        if (!section.title || !Array.isArray(section.salData)) {
          return res.status(400).json({
            message: `Each 'sect' must have a 'title' and 'salData' array`,
          });
        }

        for (const data of section.salData) {
          const salDataFields = [
            "description", "unitOfMeasures", "eqlParts", "lun", "lar",
            "alt", "quantity", "price", "amount",
          ];
          const missingDataFields = salDataFields.filter(field => data[field] === undefined);
          if (missingDataFields.length > 0) {
            return res.status(400).json({
              message: `Missing fields in salData: ${missingDataFields.join(", ")}`,
            });
          }
        }
      }
    }

    const files = req.files;
    const fileFields = ["add_additional_1", "add_additional_2", "add_additional_3"];
    const uploadedFiles = {};

    await Promise.all(
      fileFields.map(async (field) => {
        if (files?.[field]?.[0]) {
          const cloudUrl = await cloudinaryUploader(files[field][0].path);
          uploadedFiles[field] = cloudUrl.secure_url || null;
        }
      })
    );

    const account = await prisma.accounts.upsert({
      where: {
        suppCode_ordCode: {
          suppCode,
          ordCode,
        },
      },
      create: {
        suppCode,
        code,
        wbs,
        ordCode,
        adminId,
        date: new Date(formatDatePost(date)),
      },
      update: {
        date: new Date(formatDatePost(date)),
        suppCode,
        wbs,
      },
    });

    const responseData = {
      ...account,
      sal: [],
    };

    for (const salItem of invoice) {
      const { id, sect, ...restSal } = salItem;
      const isCreated = !id;
      const isdeleted = !!id;
    
      const sal = await prisma.sAL.upsert({
        where: { id: id || "non_existing_id" },
        update: {
          ...restSal,
        },
        create: {
          ...restSal,
          accId: account.id,
        },
      });
      const responseSectArray = [];
      for (const sect of salItem.sect) {
        const { id: salSectId, title, salData } = sect;

        const createdSect = await prisma.sALsect.upsert({
          where: { id: salSectId || "non_existing_id" },
          update: { title },
          create: {
            title,
            salId: sal.id,
          },
        });
        const createdSalData = [];
        for (const data of salData) {
          const { id: dataId, ...restData } = data;
          const createdData = await prisma.salData.upsert({
            where: { id: dataId || "non_existing_id" },
            update: { ...restData },
            create: {
              ...restData,
              salSectId: createdSect.id,
            },
          });
          createdSalData.push(createdData);
        }
        responseSectArray.push({
          ...createdSect,
          salData: createdSalData,
        });
      }
      const shouldUploadFiles = isCreated || (isUpdated && Object.keys(uploadedFiles).length > 0);
      let updatedSal = sal;
      if (shouldUploadFiles) {
        updatedSal = await fileUploadOfSalAttach(sal.id, uploadedFiles);
      }
      responseData.sal.push({
        ...updatedSal,
        sect: responseSectArray,
      });
    }
    
    return res.status(201).json({ message: "Account and invoice created", responseData });

  } catch (error) {
    console.error("Error creating account with invoice:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const updateAccountFields = async (req, res) => {
  try {
    const { id } = req.params;
    if(!id) return res.status(400).json({message:"id not found"})
    const {
      status,
      suppCode,
      date,
      wbs,
      type,
    } = req.body;
    if(!type) return res.status(400).json({message:"type is missing, e.g supplier or customer"})
    if(!Object.keys(AccRoles).includes(status)) return res.status(400).json({message:"Invalid status, valid ones are: 'Approvato' 'Da_approvare' 'Non_approvata'"})
    if(type === "supplier"){
      const {sal} = await prisma.accounts.findUnique({where:{id},include:{sal:true}})
      const salStatus = sal.every((item)=>item.status === "Approvato") // return true on all items otherwise false
      if(!salStatus && status === "Approvato") return res.status(400).json({message:"All sals should be approved first"})
    }
    if(type === "customer"){
      const {cdp} = await prisma.accounts.findUnique({where:{id},include:{cdp:true}})
      const cdpStatus = cdp.every((item)=>item.status === "Approvato") // return true on all items otherwise false
      if(!cdpStatus && status === "Approvato") return res.status(400).json({message:"All cdps should be approved first"})
    }
      const updatedAccount = await prisma.accounts.update({
      where: { id },
      data: {
        status: AccRoles[status] || status,
        suppCode,
        wbs,
        date: new Date(formatDatePost(date)),
      },
    });

    res.status(200).json({
      message: 'Account updated successfully',
      account: updatedAccount,
    });
  } catch (error) {
    console.error('Update Account Error:', error);
    res.status(500).json({
      message: 'Failed to update account',
      error: error.message,
    });
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
    const { ordCode } = req.params;

    // Try fetching the account first
    const acc = await prisma.accounts.findFirst({
      where: { ordCode },
      include: {
        supplier: { select: { companyName: true } },
        customer: { select: { companyName: true } },
        order: { select: { description: true, dipositRecovery: true, code:true, withholdingAmount: true, workAmount:true, iva: true, advancePayment: true, Customer:true,account:{select: {
        supplier:{select:{companyName:true}},
        customer: {select:{companyName: true}},
        code: true,
        wbs: true,
        status: true,
        order:{select:{description: true, workAmount: true}},
        sal: {
          include: {
            sect: {
              include: {
                salData: true,
              },
            },
          },
        },
        cdp: true
      }} } },
        sal: {
          include: {
            sect: {
              include: { salData: true },
            },
          },
        },
        cdp:true
      },
    });

    // If account doesn't exist, fetch order info separately
    if (!acc) {
      const order = await prisma.order.findUnique({
        where: { code: ordCode },
        select: { description: true, code: true,Customer: true,withholdingAmount: true, workAmount:true, iva: true, advancePayment: true,dipositRecovery: true },
      });
      if(!order) return res.status(400).json({message:"order not found"})
      return res.status(200).json({
        message: "Account not found, corresponding to this order",
        data: {
          ordCode: order?.code,
          progressiveNetAmount: (order.workAmount - order.withholdingAmount).toFixed(2)+"€",
          depositBalance: Math.abs(((order.dipositRecovery * 100) - order.workAmount).toFixed(2))+"€",
          discount: ((((order.withholdingAmount * order.dipositRecovery) / 100) * 100) / order.withholdingAmount).toFixed(2)+"%",
          order,
          order_desc: order?.description,
          total_sal: 0,
          total_cdp: 0,
          sal: [],
          cdp: [],
          cdp_calc_stuff:null,
          related_acc: []
        },
      });
    }

    const { order, supplier,customer, sal, cdp, status, ...rest } = acc;
    const calulated_stuff = {
      contractAmount: order.workAmount+"€",
      advancePayment: order.advancePayment+"€",
      reduceAdvPayment: (order.advancePayment * ((((order.withholdingAmount * order.dipositRecovery) / 100) * 100) / order.withholdingAmount)/100).toFixed(2)+"€",
      progressiveNetAmount: (order.workAmount - order.withholdingAmount).toFixed(2)+"€",
      depositBalance: /*((order.dipositRecovery * order.workAmount) / 100).toFixed(2)+"€"*/ Math.abs(((order.dipositRecovery * 100) - order.workAmount).toFixed(2))+"€",
      withholdings: order.withholdingAmount+"%",
      depositRecovery: order.dipositRecovery+"%",
      discount: ((((order.withholdingAmount * order.dipositRecovery) / 100) * 100) / order.withholdingAmount).toFixed(2)+"%",
      reducedAmount: (order.workAmount - order.advancePayment).toFixed(3)+"€",
      currentWorksAmount: order.workAmount+"€",
      advancePayment: order.advancePayment+"€",
      withholdingTax: order.withholdingAmount+"€",
      amtPresentCDP: cdp.reduce((sum, cdpItem) => sum + parseFloat(cdpItem.currentWorkAmountNotSubjectToDiscount || 0),0)+"€",
      vatAmt: ((order.workAmount * parseFloat(order.iva || 0)) / 100).toFixed(2)+"€",
      totalToBePaid: cdp.reduce((sum, item)=> sum + parseFloat(item.currentWorkAmountSubjectToReduction || 0),0)+"€"
    }
    
    const transformed = {
      ...rest,
      order_desc: order?.description || "",
      supplier_name: supplier?.companyName || "",
      custCode: order?.Customer?.code,
      customer_name: order.Customer?.companyName || "",
      status: AccRoles[status] || status,
      date: formatDate(acc.date),
      total_sal: sal.length,
      total_cdp: cdp.length,
      cdp_calc_stuff: calulated_stuff,
      related_acc: order.account.map(({ sal, cdp, ...accRest }) => ({
        ...accRest,
        sal_count: sal?.length || 0,
        cdp_count: cdp?.length || 0
      })),
      sal: sal.map((rest)=> ({...rest,status: AccRoles[rest.status] || rest.status})),
      cdp
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
      where: { adminId,NOT:{suppCode:null} },
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
      orderBy: {
            createdAt: "desc",
          }
    });
    acc = acc
      .map((item) => ({
        ...item,
        status: AccRoles[item.status] || item.status,
        date: formatDate(item.date),
        supplierName: item.supplier?.companyName,
        ordDesc: item.order.description,
        workAmount: formatNumberWithThousands(Number(item.order.workAmount.toFixed(2)))+"€",
        total_sal: item.sal.length,
        // progressive_SAL_amount: item.sal.reduce((sum, salItem) => sum + parseFloat(salItem.agreed || 0),0)
      }))
      .map(({ sal, supplier, order,custCode,see_CDP,current_SAL_amount,progressive_SAL_amount, ...rest }) => rest);
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
        current_SAL_amount: (account.current_SAL_amount?.toFixed(3) ?? "0.00")+ " €" ,
        progressive_SAL_amount: account.sal.reduce((sum, salItem) => sum + parseFloat(salItem.agreed || 0),0).toFixed(3)+"€",
        sal: account.sal.map((sal)=>({...sal, total: "€"+(sal.total?.toFixed(3)), discounts: "€" + (sal.discounts?.toFixed(3)), roundingDiscount: "€" + (sal.roundingDiscount?.toFixed(3)), agreed: "€" + (sal.agreed?.toFixed(3))})),
        date: formatDate(account.date),
        status: AccRoles[account.status] || account.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const generatePDF = async (req, res) => {
  try {
    const {aid} = req.params
    const file = await cloudinaryUploader(req.file.path);
    if(!aid || !file) return res.status(400).json({message:"missing required fields"})
    await prisma.accounts.update({where:{id:aid}, data:{see_SAL: file.secure_url}})
    return res.status(200).json({message:"PDF generated and saved !", data: file.secure_url})
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

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

export const createAccountWithClient = async (req, res) => {
  try {
    const { id: adminId } = req.user;
    const { custCode, date, ordCode, code, CDP } = req.body;

    const requiredFields = ["custCode", "date", "ordCode", "CDP", "code"];
    const missingField = requiredFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }
    const invoice = JSON.parse(CDP);
    const requiredInvoiceFields = [
      "iva",
      "currentWorkAmountSubjectToReduction",
      "currentWorkAmountNotSubjectToDiscount",
    ];
    const missingFieldInCDP = requiredInvoiceFields.find((field) => !invoice[field]);
    if (missingFieldInCDP) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingFieldInCDP}` });
    }

    const files = req.files;
    const fileFields = ["add_additional_1", "add_additional_2", "add_additional_3"];
    const uploadedFiles = {};

    await Promise.all(
      fileFields.map(async (field) => {
        if (files?.[field]?.[0]) {
          const cloudUrl = await cloudinaryUploader(files[field][0].path);
          uploadedFiles[field] = cloudUrl.secure_url || null;
        } else {
          uploadedFiles[field] = null;
        }
      })
    );
    const account = await prisma.accounts.upsert({
      where: {
        custCode_ordCode: {
          custCode,
          ordCode,
        },
      },
      create: {
        custCode,
        code,
        ordCode,
        adminId,
        date: new Date(formatDatePost(date)),
      },
      update: {
        date: new Date(formatDatePost(date)),
      },
    });

    const responseData = {
      ...account,
      cdp: [],
    };

    const { id, ...restCdp } = invoice;
    const isCreated = !id;
    const isUpdated = !!id;

    const iva = parseFloat(restCdp.iva);
    const subjectToReduction = parseFloat(restCdp.currentWorkAmountSubjectToReduction);
    const notSubjectToDiscount = parseFloat(restCdp.currentWorkAmountNotSubjectToDiscount);

    const order = await prisma.order.findUnique({
      where: { code:ordCode },
      select: {
        advancePayment: true,
        dipositRecovery: true,
        withholdingAmount: true,
        workAmount: true,
        iva: true
      },
    });

    const advancePayment = parseFloat(order?.advancePayment || 0);
    const dipositRecovery = parseFloat(order?.dipositRecovery || 0);
    const withholdingAmount = parseFloat(order?.withholdingAmount || 0);

    const reducedAmount = subjectToReduction;
    const currentWorksAmount = parseFloat(order?.workAmount);
    const amtPresentCDP =
      currentWorksAmount - advancePayment - withholdingAmount - dipositRecovery;
    const vat = (amtPresentCDP * iva) / 100;
    const totalAmount = amtPresentCDP + vat;

    const cdp = await prisma.cDP.upsert({
      where: { id: id || "non_existing_id" },
      update: {
        ...restCdp,
        iva,
        currentWorkAmountSubjectToReduction: subjectToReduction,
        currentWorkAmountNotSubjectToDiscount: notSubjectToDiscount,
        reducedAmount,
        currentWorksAmount,
        advPayment: advancePayment,
        withholdingTax: withholdingAmount,
        amtPresentCDP,
        vat,
        totalAmount,
      },
      create: {
        ...restCdp,
        accId: account.id,
        iva,
        currentWorkAmountSubjectToReduction: subjectToReduction,
        currentWorkAmountNotSubjectToDiscount: notSubjectToDiscount,
        reducedAmount,
        currentWorksAmount,
        advPayment: advancePayment,
        withholdingTax: withholdingAmount,
        amtPresentCDP,
        vat,
        totalAmount,
      },
    });

    const shouldUploadFiles = isCreated || (isUpdated && Object.keys(uploadedFiles).length > 0);

    let updatedCdp = cdp;
    if (shouldUploadFiles) {
      updatedCdp = await fileUploadOfCdpAttach(cdp.id, uploadedFiles);
    }

    responseData.cdp.push({
      ...updatedCdp,
      add_additional_1: uploadedFiles.add_additional_1 || updatedCdp.add_additional_1,
      add_additional_2: uploadedFiles.add_additional_2 || updatedCdp.add_additional_2,
      add_additional_3: uploadedFiles.add_additional_3 || updatedCdp.add_additional_3,
    });

    return res.status(201).json({ message: "Account and invoice created", responseData });
  } catch (error) {
    console.error("Error in createAccountWithClient:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getAllAccountWithClient = async (req, res) => {
  try {
    const { id: adminId } = req.user;
    let acc = await prisma.accounts.findMany({
      where: { adminId,NOT:{custCode:null} },
      include: {
        customer: true,
        order: true,
        cdp: {
          include: true
        },
      },
      orderBy:{createdAt:'desc'}
    });
    acc = acc
      .map((item) => ({
        ...item,
        status: AccRoles[item.status] || item.status,
        date: formatDate(item.date),
        customerName: item.customer?.companyName,
        ordDesc: item.order.description,
        workAmount: formatNumberWithThousands(Number(item.order.workAmount.toFixed(2)))+ "€",
        total_cdp: item.cdp.length,
        // progressive_SAL_amount: item.sal.reduce((sum, salItem) => sum + parseFloat(salItem.agreed || 0),0)
      }))
      .map(({ cdp, customer, order,suppCode,see_SAL,current_SAL_amount,progressive_SAL_amount, ...rest }) => rest);
    return res
      .status(200)
      .json({ message: "account with customers fetched", data: acc });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const getAccountWithClientById = async (req, res) => {
  try {
    const { id } = req.params;
    let account = await prisma.accounts.findUnique({
      where: { id },
      include: {
        cdp: true,
        sal: { select: { id: true } },
        customer: { select: { companyName: true } },
        order: {
          select: {
            dipositRecovery: true,
            workAmount: true,
            advancePayment: true,
            withholdingAmount: true,
            description: true,
            iva: true,
          },
        },
      },
    });
    if (!account) return res.status(404).json({ message: "Not found" });
    const {order , cdp } = account
    const calulated_stuff = {
      contractAmount: order.workAmount+"€",
      advancePayment: order.advancePayment+"€",
      reduceAdvPayment: (order.advancePayment * ((((order.withholdingAmount * order.dipositRecovery) / 100) * 100) / order.withholdingAmount)/100).toFixed(2)+"€",
      progressiveNetAmount: (order.workAmount - order.withholdingAmount).toFixed(2)+"€",
      depositBalance: /*((order.dipositRecovery * order.workAmount) / 100).toFixed(2)+"€"*/ Math.abs(((order.dipositRecovery * 100) - order.workAmount).toFixed(2))+"€",
      withholdings: order.withholdingAmount+"%",
      depositRecovery: order.dipositRecovery+"%",
      discount: ((((order.withholdingAmount * order.dipositRecovery) / 100) * 100) / order.withholdingAmount).toFixed(2)+"%",
      reducedAmount: (order.workAmount - order.advancePayment).toFixed(3)+"€",
      currentWorksAmount: order.workAmount+"€",
      advancePayment: order.advancePayment+"€",
      withholdingTax: order.withholdingAmount+"€",
      amtPresentCDP: cdp.reduce((sum, cdpItem) => sum + parseFloat(cdpItem.currentWorkAmountNotSubjectToDiscount || 0),0)+"€",
      vatAmt: ((order.workAmount * parseFloat(order.iva || 0)) / 100).toFixed(2)+"€",
      totalToBePaid: cdp.reduce((sum, item)=> sum + parseFloat(item.currentWorkAmountSubjectToReduction || 0),0)+"€"
    }
    const transformed = {
      ...account,
      calulated_stuff,
      total_SAL: account.sal?.length || 0,
      total_CDP: account.cdp?.length || 0,
    };

    delete transformed.sal;

    return res.status(200).json({
      message: "found",
      data: {
        ...transformed,
        date: formatDate(transformed.date),
        status: AccRoles[transformed.status] || transformed.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const generatePDF_C = async (req, res) => {
  try {
    const {aid} = req.params
    const file = await cloudinaryUploader(req.file.path);
    if(!aid || !file) return res.status(400).json({message:"missing required fields"})
    await prisma.accounts.update({where:{id:aid}, data:{see_CDP: file.secure_url}})
    return res.status(200).json({message:"PDF generated and saved !", data: file.secure_url})
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const updateSAL = async (req, res) => {
   try {
    const { id } = req.params;
    if(!id) return res.status(400).json({message:"id not found"})
    const {
      status
    } = req.body;

    if(!Object.keys(AccRoles).includes(status)) return res.status(400).json({message:"Invalid status, valid ones are: 'Approvato' 'Da_approvare' 'Non_approvata'"})
    await prisma.sAL.update({
      where: { id },
      data: {
        status,
        ...req.body
      },
    });

    res.status(200).json({
      message: 'SAL updated successfully'
    });
  } catch (error) {
    console.error('Update SAL Error:', error);
    res.status(500).json({
      message: 'Failed to update account',
      error: error.message,
    });
  }
}

export const updateCDP = async (req, res) => {
   try {
    const { id } = req.params;
    if(!id) return res.status(400).json({message:"id not found"})
    const {
      status
    } = req.body;

    if(!Object.keys(AccRoles).includes(status)) return res.status(400).json({message:"Invalid status, valid ones are: 'Approvato' 'Da_approvare' 'Non_approvata'"})
    await prisma.cDP.update({
      where: { id },
      data: {
        status,
        ...req.body
      },
    });

    res.status(200).json({
      message: 'CDP updated successfully'
    });
  } catch (error) {
    console.error('Update CDP Error:', error);
    res.status(500).json({
      message: 'Failed to update account',
      error: error.message,
    });
  }
}

export const deleteSAL = async (req, res) => {
   try {
    const { id } = req.params;
    if(!id) return res.status(400).json({message:"id not found"})

    await prisma.sAL.delete({
      where: { id }
    });

    res.status(200).json({
      message: 'SAL deleted successfully'
    });
  } catch (error) {
    console.error('delete SAL Error:', error);
    res.status(500).json({
      message: 'Failed to delete account',
      error: error.message,
    });
  }
}

export const deleteCDP = async (req, res) => {
   try {
    const { id } = req.params;
    if(!id) return res.status(400).json({message:"id not found"})

    await prisma.cDP.delete({
      where: { id }
    });

    res.status(200).json({
      message: 'CDP deleted successfully'
    });
  } catch (error) {
    console.error('delete CDP Error:', error);
    res.status(500).json({
      message: 'Failed to delete account'
    });
  }
}