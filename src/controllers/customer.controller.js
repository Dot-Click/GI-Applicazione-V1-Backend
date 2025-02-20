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
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const createCust = async (req, res) => {
  try {
    const { id } = req.user;
    const { email, password } = req.body;
    const ifExist = await prisma.customer.findUnique({
      where: { email: email },
    });
    if (ifExist) {
      return res.status(400).json({ message: "Customer already exists" });
    }
    const reqFields = [
      "companyName",
      "vat",
      "taxId",
      "ateco",
      "nation",
      "province",
      "address",
      "common",
      "cap",
      "pec",
      "email",
      "telephone",
    ];
    for (let field of reqFields) {
      if (!req.body[field]) {
        return res.status(404).json({
          message: `Missing required field: ${field}`,
        });
      }
    }
    const customerData = { ...req.body, adminId: id };
    if (password) {
      customerData.password = await bcrypt.hash(password, 10);
    }
    const customer = await prisma.customer.create({
      data: customerData,
    });

    return res
      .status(200)
      .json({ message: "Customer created", data: customer });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCust = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(404).json({ message: "id not found" });
    const cust = await prisma.customer.update({
      where: { id: id },
      data: { ...req.body },
    });
    return res.status(200).json({ message: "updated sucessfully", data: cust });
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
    const users = await prisma.customer.findMany({
      where: { adminId: id },
      take: 10,
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
    const cust = await prisma.customer.findUnique({ where: { id: id } });
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
    const cust = await prisma.customer.findMany({ where: { companyName } });
    if (!cust) return res.status(404).json({ message: "customer not found" });
    return res
      .status(200)
      .json({ message: "customer found successfully", data: cust });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
