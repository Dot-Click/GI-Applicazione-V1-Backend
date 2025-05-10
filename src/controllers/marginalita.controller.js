import prisma from "../../prisma/prisma.js";

// export const getAllmarginalities = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let data = await prisma.invoice.findMany({
//       include: {
//         Customer: {
//           select: {
//             companyName: true,
//             orders: { select: { description: true, advancePayment: true, dipositRecovery:true, workAmount:true } },
//           },
//         },
//         ricavi: { select: { revAmt: true } },
//         costi: { select: { revAmt: true } },
//       },
//     });
//     data = data.map((obj)=>({
//         customerName: obj.Customer.companyName,
//         orderDescription: obj.Customer.orders.map((order)=>({description: order.description})),
//         ricavi: obj.ricavi?.map((ric)=>({revAmt: ric.revAmt})),
//         costi: obj.costi?.map((cos)=>({revAmt: cos.revAmt}))
//     }))
//     res.status(200).json({
//       success: true,
//       data
//     });
//   } catch (error) {
//     console.error("Error fetching marginalities:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch marginalities data",
//       error: error.message,
//     });
//   }
// };

export const getAllmarginalities = async (req, res) => {
  try {
    const { id } = req.user;
    let data = await prisma.order.findMany({
      where: { adminId: id },
      select: {
        description: true,
        id: true,
        Customer: {
          select: {
            companyName: true,
            ricavi: { select: { revAmt: true, id: true } },
          },
        },
        supplier: {
          select: {
            companyName: true,
            costi: { select: { revAmt: true, id: true } },
          },
        },
        advancePayment: true,
        workAmount: true,
        dipositRecovery: true,
      },
    });

    data = data
      .map((obj) => ({
        ...obj,
        customerName: obj.Customer.companyName,
        supplierName: obj.supplier?.companyName,
        totalRevAmt:
          obj.Customer.ricavi
            .reduce((sum, curr) => sum + Number(curr.revAmt), 0)
            .toString() || "0",
        revId: obj.Customer.ricavi.map((obj) => ({ id: obj.id })),
        totaCostAmt:
          obj.supplier?.costi
            ?.reduce((sum, curr) => sum + Number(curr.revAmt), 0)
            .toString() || "0",
        cosId: obj.supplier?.costi?.map((obj) => ({ id: obj.id })),
      }))
      .map(({ Customer, supplier, ...rest }) => rest);

    return res.status(200).json({
      message: "fetched",
      data,
    });
  } catch (error) {
    console.error("Error fetching marginalities:", error);
    return res.status(500).json({
      message: "Failed to fetch marginalities data",
      error: error.message,
    });
  }
};

export const getMarginalitaOfOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const marginalita = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        dipositRecovery: true,
        workAmount: true,
        supplier: { select: { costi: {select:{revAmt:true,advancePayment:true}} } },
        Customer: { select: { ricavi: {select:{revAmt:true,advancePayment:true}} } },
      },
    });
    return res.status(200).json({ message: "fetched!", data: marginalita });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getMarginalitaOfRicavi = async (req, res) => {
    try {
        const {id} =req.user
        const ricavi= await prisma.ricavi.findMany({where:{adminId:id}})
        return res.status(200).json({message:"fetched!",data:ricavi})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

export const getMarginalitaOfCosti = async (req, res) => {
    try {
        const {id} =req.user
        const costi= await prisma.costi.findMany({where:{adminId:id}})
        return res.status(200).json({message:"fetched!",data:costi})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}
