import "dotenv/config";
import prisma from "../../prisma/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAndSaveToken } from "../lib/utils.js";

const { sign, verify } = jwt;

export const signup = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const exist = await prisma.client.findUnique({ where: { email: email } });
    if (exist) {
      return res.status(400).json({ error: "User already exists" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.client.create({
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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const user = await prisma.client.findUnique({ where: { email: email } });
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



export const getAllUsers = async (req, res) => {
  try {
    const { id } = req.user;
    const users = await prisma.client.findMany({ where: { adminId: id } });
    if (!users) {
      return res.status(404).json({ message: "No user found", data: [] });
    }
    return res.status(200).json({ data: users, message: "All users fetched" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    let count = Math.round(Math.random() * 100);
    const email = `admin${count}@gmail.com`;
    const name = `admin${count}`;
    const password = `admin1234${count}`;

    const hash = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: { email, name, password: hash },
    });
    if (!admin) {
      return res.status(400).json({ message: "Admin not created" });
    }
    generateAndSaveToken(admin, res);
    return res
      .status(200)
      .json({ message: "Admin created", data: { email, password } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: "Tutti i campi sono obbligatori" });
    }
    const user = await prisma.admin.findUnique({ where: { email: email } });
    if (!user) return res.status(400).json({ message: "L’indirizzo email inserito non è associato a GI Costruzioni" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "La password non è corretta. Riprova o reimposta la tua password se l'hai dimenticata" });
    generateAndSaveToken(user, res);
    return res
      .status(200)
      .json({ message: "logged in Successfully", data: user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("L'e-mail è obbligatoria!");
    const verify = await prisma.admin.findUnique({ where: { email: email } });
    if (!verify) {
      return res
        .status(401)
        .json({ message: "L’indirizzo email inserito non è associato a GI Costruzioni", status: false });
    }
    const verfToken = sign(
      { role: verify.role, id: verify.id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1m",
      }
    );
    res.cookie("email-verf-token", verfToken, { httpOnly: false });
    return res
      .status(200)
      .json({ message: "Ti abbiamo inviato un’e-mail per consentirti di reimpostare la password", status: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(401).json({ message: "Missing Required Fields" });
    }
    if (token) {
      const verf = verify(token, process.env.JWT_SECRET);
      if (!verf) {
        return res
          .status(401)
          .json({ message: "Verification Expired", status: false });
      }
      const hash = await bcrypt.hash(newPassword, 10);
      await prisma.admin.update({
        where: { id: verf.id },
        data: { password: hash },
      });
      return res
        .status(200)
        .json({ message: "Ottimo! La tua password è stata cambiata con successo", status: true });
    }
    return res
      .status(401)
      .json({ message: "Invalid request token not found", status: false });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};