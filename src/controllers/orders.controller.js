import prisma from "../../prisma/prisma.js";

export const createOrder = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      jobDescription,
      projectManager,
      technicalManager,
      constructionManager,
      address,
      state,
    } = req.body;
    const order = await prisma.order.create({
      data: {
        jobDescription,
        projectManager,
        technicalManager,
        constructionManager,
        clientId: id,
        address,
        state,
      },
    });
    return res
      .status(200)
      .json({ message: "Order Created Sucessfully", data: order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { id } = req.user;
    const orders = await prisma.order.findMany({ where: { clientId: id } });
    if (!orders) {
      return res.status(200).json({ message: "No current orders", data: [] });
    }
    return res
      .status(200)
      .json({ message: "All orders fetched", data: orders });
  } catch (error) {
    return res.status.json({ message: error.message });
  }
};
