import "dotenv/config";
import prisma from "../../prisma/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const orderStateMap = {
  ON_HOLD: "In attesa",
  IN_PROGRESS: "In corso",
  CANCELLED: "Cancellato",
  COMPLETATO: "Completato",
};
export const signup = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const exist = await prisma.customer.findUnique({ where: { email: email } });
    if (exist) {
      return res.status(400).json({ error: "User already exists" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.customer.create({
      data: {
        name,
        email,
        adminId: id,
        password: hash,
      },
    });
    return res
      .status(201)
      .json({ message: "User created successfully", data: user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createCust = async (req, res) => {
  try {
    const { id } = req.user;
    const { code,email, ...customerData } = req.body;

    const requiredFields = [
      "companyName",
      "vat",
      "taxId",
      "code",
      "nation",
      "province",
      "common",
      "cap",
      "address",
    ];

    const missingField = requiredFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }
    const ifExist = await prisma.customer.findUnique({ where: { code } });
    if (ifExist) {
      return res.status(409).json({ message: "Customer already exists" });
    }

    let count = Math.round(Math.random() * 100);
    const randomPass = `customer${count}`;
    customerData.password = await bcrypt.hash(randomPass, 10);
    customerData.email = email || null;
    const customer = await prisma.customer.create({
      data: {...customerData, code, adminId: id},
      omit: { password: true },
    });

    return res.status(201).json({
      message: "Customer created successfully",
      data: { ...customer },
      login_crdentials: { password: randomPass, email: customer?.email },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCust = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const existingCust = await prisma.customer.findUnique({ where: { id } });
    if (!existingCust) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const { password,email, ...updateData } = req.body;
    if(email) return res.status(400).json({message:"email is non-editable"})
    const updatedCust = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...customerResponse } = updatedCust;

    return res.status(200).json({
      message: "Customer updated successfully",
      data: customerResponse,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCusts = async (req,res) => {
  try {
    const { id } = req.user;
    const {customers} = req.body
    if(!customers) return res.status(404).json({message:"Bad Request"})
    const requiredFields = [
      "companyName",
      "vat",
      "taxId",
      "code",
      "nation",
      "province",
      "common",
      "cap",
      "address",
    ];
     const invalidcustomer = customers.find(customer => 
      requiredFields.some(field => !customer[field])
    );
    if (invalidcustomer) {
      const missingFields = requiredFields.filter(field => !invalidcustomer[field]);
      return res.status(400).json({
        message: `An customer is missing required fields: ${missingFields.join(", ")}`,
      });
    }
    const telRegex = /^\+\d{1}\s\(\d{3}\)\s\d{4}\s\d{4}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let invalidFields = [];
  customers.find(({ companyName,telephone, email, pec }) => {

    if (!telRegex.test(telephone)) invalidFields.push("telephone");
    if (!emailRegex.test(email)) invalidFields.push("email");
    if (!emailRegex.test(pec)) invalidFields.push("pec");

    if (invalidFields.length > 0) {
        return res.status(400).json({ 
            message: `Invalid fields for ${companyName}: ${invalidFields.join(", ")}` 
        });
    }
  });
    const multiplecustomer = await prisma.customer.createMany({data: customers.map(customer => ({ ...customer, adminId: id })), skipDuplicates: true})
    if(!multiplecustomer.count) return res.status(400).json({message:"Customers already exists"})
    return res.status(200).json({message:`customers added: ${multiplecustomer.count}`})
  } catch (error) {
    return res.status(500).json({message: error.message})
  }
};

export const deleteCust = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) return res.status(400).json({ message: "Bad request" });
    const cust = await prisma.customer.deleteMany({
      where: { id: { in: ids } },
    });
    if (!cust.count) return res.status(404).json({ message: "ids not found" });
    return res.status(200).json({ message: "Customer deleted!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const user = await prisma.customer.findUnique({ where: { email: email } });
    if (!user) return res.status(400).json({ message: "Invalid Email" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid Password" });
    }
    const token = jwt.sign(
      { user: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );
    res.cookie(`token`, `Bearer ${token}`, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 180 * 180 * 1000,
    });
    return res.status(200).json({ message: "Login successful", data: user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// export const logout = async (req, res) => {
//   try {
//     res.clearCookie("token", {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//     });
//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//     });
//     return res.status(200).json({ message: "logout successfull" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// }; //optional

export const getAllCustomers = async (req, res) => {
  try {
    const { id } = req.user;
    let { page } = req.query;
    page = parseInt(page, 10);
    if (isNaN(page) || page < 1) page = 1;
    const users = await prisma.customer.findMany({
      where: { adminId: id },
      take: 10,
      skip: (page - 1) * 10,
      omit: { password: true },
    });
    if (!users) {
      return res.status(404).json({ message: "No user found", data: [] });
    }
    return res.status(200).json({ data: users, message: "All users fetched" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateCustSequence = async (req, res) => {
  try {
    const { id } = req.user;
    const { addedColArray, visibleColArray } = req.body;
    if (!addedColArray || !visibleColArray) {
      return res.status(400).json({ error: "missing required fields" });
    }
    if (!Array.isArray(addedColArray) || !Array.isArray(visibleColArray))
      return res.status(406).json({ error: "Invalid type" });
    if (
      (addedColArray && !visibleColArray) ||
      (!addedColArray && visibleColArray)
    ) {
      return res.status(400).json({
        error: "addedColArray and visibleColArray must be provided together.",
      });
    }
    const reqOrdval = [
      "companyName",
      "vat",
      "taxId",
      "nation",
      "province",
      "address",
      "common",
      "cap",
      "code",
      "pec",
      "telephone",
      "email",
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
    await prisma.custSequence.upsert({
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

export const getCustSequence = async (req, res) => {
  try {
    const { id } = req.user;
    const seq = await prisma.custSequence.findUnique({
      where: { adminId: id },
    });
    if (!seq) {
      return res.status(404).json({ message: "sequence not found" });
    }
    return res.status(200).json(seq);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const cust = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            Customer: true,
            supplier: true,
          },
        },
      },
      omit: { password: true },
    });
    if (!cust) return res.status(404).json({ message: "not found" });
    if (!cust.orders.length) {
      return res.status(200).json({ message: "No current orders", data: cust });
    }
    const custOrders = cust.orders.map((order) => ({
      ...order,
      state: orderStateMap[order.state] || order.state,
      startDate: new Date(order.startDate).toLocaleDateString(),
      endDate: new Date(order.endDate).toLocaleDateString(),
      advancePayment: Number(order.advancePayment).toFixed(2)+"€",
        withholdingAmount: Number(order.withholdingAmount).toFixed(2)+"%",
        workAmount: Number(order.workAmount).toFixed(2)+"€",
        dipositRecovery: Number(order.dipositRecovery).toFixed(2)+"%",
        iva: Number(order.iva).toFixed(2)+"%",
      customerName: order.Customer?.companyName || null,
      supplierName: order.supplier?.companyName || null,
    })).map(({ Customer, supplier, ...rest }) => rest);
    return res
      .status(200)
      .json({
        message: "sucessfully get a user",
        data: { ...cust, orders: custOrders },
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const searchCustomer = async (req, res) => {
  try {
    const { companyName } = req.query;
    if (!companyName)
      return res
        .status(400)
        .json({ message: "missing required query field: companyName" });
    const cust = await prisma.customer.findMany({
      where: { companyName: { contains: companyName, mode: "insensitive" } },
      omit: { password: true },
    });
    if (!cust || !cust.length) {
      return res.status(404).json({ message: "customer not found" });
    }
    return res
      .status(200)
      .json({ message: "customer found successfully", data: cust });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
