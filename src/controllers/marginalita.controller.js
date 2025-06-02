import prisma from "../../prisma/prisma.js";
import { formatDate, formatNumberWithThousands } from "../lib/utils.js";

const orderStateMap = {
  ON_HOLD: "In attesa",
  IN_PROGRESS: "In corso",
  CANCELLED: "Cancellato",
  COMPLETATO: "Completato",
}

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

/* formulas
 1. Marginalità (Profit in €)
    Marginalità = Ricavi Totali − Costi Totali

 2. Percent Marginalità (%)
    Percent Marginalità (%) = (Marginalità / Ricavi Totali) × 100, where Ricavi Totali ≠ 0

 3. Percent Avanzamento Lavori (Progress %)
    Percent Avanzamento = (dipositRecovery / workAmount) × 100, where workAmount ≠ 0

  - Ricavi Totali: Sum of all revenues (Customer revAmt)
  - Costi Totali: Sum of all costs (Supplier revAmt)
*/

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
      orderBy:{createdAt:'desc'}
    });

    data = data
      .map((obj) => {
        const totalRevAmt = obj.Customer?.ricavi?.reduce(
          (sum, curr) => sum + Number(curr.revAmt || 0),
          0
        ) || 0;

        const totalCostAmt = obj.supplier?.costi?.reduce(
          (sum, curr) => sum + Number(curr.revAmt || 0),
          0
        ) || 0;

       const rawMarginalitaVal = totalRevAmt - totalCostAmt;
       const marginalitaVal = isNaN(rawMarginalitaVal) ? 0 : Math.max(0, rawMarginalitaVal);
       const percentMarginalita = isNaN(totalRevAmt) || totalRevAmt === 0 ? 0 : 
          (marginalitaVal / totalRevAmt) * 100;

        const dipositRecovery = Number(obj.dipositRecovery || 0);
        const workAmount = Number(obj.workAmount || 0);
        const percentAvanzamentoRaw =
          workAmount === 0 ? 0 : (dipositRecovery / workAmount) * 100;
        const percentAvanzamento = isNaN(percentAvanzamentoRaw) ? 0 : Math.min(percentAvanzamentoRaw, 100);

        return {
          ...obj,
          ordDescription: obj.description || '',
          customerName: obj.Customer?.companyName || '',
          supplierName: obj.supplier?.companyName || '',
          totalRevAmt: formatNumberWithThousands(totalRevAmt.toFixed(3)) + "€",
          totalCostAmt: formatNumberWithThousands(totalCostAmt.toFixed(3)) + "€",
          marginalitaVal: formatNumberWithThousands(marginalitaVal.toFixed(3)) + "€",
          percentMarginalita: percentMarginalita.toFixed(2) + "%",
          percentAvanzamento: percentAvanzamento.toFixed(2) + "%",
        };
      })
      .map(({ Customer, supplier,description, ...rest }) => rest);

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
        description: true,
        workAmount: true,
        state: true,
        supplier: {
          select: {costi: true},
        },
        Customer: {
          select: {
            ricavi: true,
          },
        },
      },
    });
    const ricavi = marginalita.Customer?.ricavi?.reduce(
      (sum, r) => sum + Number(r.revAmt || 0),
      0
    ) || 0;
    const costi = marginalita.supplier?.costi?.reduce(
      (sum, c) => sum + Number(c.revAmt || 0),
      0
    ) || 0;

    const marginalitaVal = ricavi - costi;
    const percentMarginalita = isNaN(ricavi) || ricavi === 0 ? 0 :
      (marginalitaVal / ricavi) * 100;

    const dipositRecovery = Number(marginalita.dipositRecovery || 0);
    const workAmount = Number(marginalita.workAmount || 0);
    const percentAvanzamento = isNaN(workAmount) || workAmount === 0 ? 0 :
      (dipositRecovery / workAmount) * 100;

    return res.status(200).json({
      message: "fetched!",
      data: {
        ...marginalita,
        ricaviTotal: formatNumberWithThousands(ricavi.toFixed(3)) + "€",
        workAmount: formatNumberWithThousands(workAmount.toFixed(3)) + "€",
        status: orderStateMap[marginalita.state] || "N/A",
        costiTotal: formatNumberWithThousands(costi.toFixed(3)) + "€",
        margVal: formatNumberWithThousands(marginalitaVal.toFixed(3)) + "€",
        percentMarginalita: percentMarginalita.toFixed(2) + "%",
        percentAvanzamento: percentAvanzamento.toFixed(2) + "%",
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getMarginalitaOfRicavi = async (req, res) => {
  try {
    const { id } = req.user;
    const ricavi = await prisma.ricavi.findMany({ where: { adminId: id } });
    return res.status(200).json({ message: "fetched!", data: ricavi });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMarginalitaOfCosti = async (req, res) => {
  try {
    const { id } = req.user;
    const costi = await prisma.costi.findMany({ where: { adminId: id } });
    return res.status(200).json({ message: "fetched!", data: costi });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}