import "dotenv/config";
import prisma from "../../prisma/prisma.js";
import bcrypt from "bcrypt";
import { generateAndSaveToken } from "../lib/utils.js";

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
    const { email, ...customerData } = req.body;

    const ifExist = await prisma.customer.findUnique({ where: { email } });
    if (ifExist) {
      return res.status(409).json({ message: "Customer already exists" });
    }

    const requiredFields = [
      "companyName",
      "vat",
      "taxId",
      "nation",
      "province",
      "common",
      "cap",
      "address",
      "pec",
      "email",
      "telephone",
    ];

    const missingField = requiredFields.find((field) => !req.body[field]);
    if (missingField) {
      return res
        .status(400)
        .json({ message: `Missing required field: ${missingField}` });
    }

    let count = Math.round(Math.random() * 100);
    const randomPass = `customer${count}`;
    customerData.password = await bcrypt.hash(randomPass, 10);
    customerData.adminId = id;
    customerData.email = email;
    const customer = await prisma.customer.create({
      data: customerData,
      omit: { password: true },
    });

    return res.status(201).json({
      message: "Customer created successfully",
      data: { ...customer, password: randomPass },
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

    const { password, ...updateData } = req.body;

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
    generateAndSaveToken(user, res);
    return res.status(200).json({ message: "Login successful", data: user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "logout sucessfull" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; //optional

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

export const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const cust = await prisma.customer.findUnique({
      where: { id: id },
      omit: { password: true },
    });
    if (!cust) return res.status(404).json({ message: "not found" });
    return res
      .status(200)
      .json({ message: "sucessfully get a user", data: cust });
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
    if (!cust) return res.status(404).json({ message: "customer not found" });
    return res
      .status(200)
      .json({ message: "customer found successfully", data: cust });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
