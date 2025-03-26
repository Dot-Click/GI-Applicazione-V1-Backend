import "dotenv/config";
import prisma from "../../prisma/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAndSaveToken } from "../lib/utils.js";

const { sign, verify } = jwt;

export const createAdmin = async (req, res) => {
  try {
    let count = Math.round(Math.random() * 100);
    const email = `admin${count}@gmail.com`;
    const name = `admin${count}`;
    const password = `admin1234${count}`;

    const hash = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: { email, name, password: hash },
      omit: { password: true },
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
    const { email, password, isRemember } = req.body;
    if (!email || !password) {
      return res
        .status(401)
        .json({ message: "Tutti i campi sono obbligatori" });
    }
    const user = await prisma.admin.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({
        message: "L’indirizzo email inserito non è associato a GI Costruzioni",
      });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        message:
          "La password non è corretta. Riprova o reimposta la tua password se l'hai dimenticata",
      });
    generateAndSaveToken(user, res, isRemember ?? false);
    delete user.password;
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
    const verify = await prisma.admin.findUnique({ where: { email } });
    if (!verify) {
      return res.status(401).json({
        message: "L’indirizzo email inserito non è associato a GI Costruzioni",
        status: false,
      });
    }
    const verfToken = sign(
      { role: verify.role, id: verify.id },
      process.env.JWT_SECRET,
      {
        expiresIn: "25s",
      }
    );
    return res.status(200).json({
      message:
        "Ti abbiamo inviato un’e-mail per consentirti di reimpostare la password",
      token: verfToken,
      expiresAt: new Date(Date.now() + 25 * 1000).toISOString(),
      status: true,
    });
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
      return res.status(200).json({
        message: "Ottimo! La tua password è stata cambiata con successo",
        status: true,
      });
    }
    return res
      .status(401)
      .json({ message: "Invalid request token not found", status: false });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAdminInfo = async (req, res) => {
  try {
    const { id } = req.user;
    const orderStateMap = {
      ON_HOLD: "In attesa",
      IN_PROGRESS: "In corso",
      CANCELLED: "Cancellato",
      COMPLETATO: "Completato",
    };
    const EmpRoles= {
      Technical_Manager : 'Technical Manager',
      Order_Manager : 'Order Manager',
      Construction_Manager : 'Construction Manager',
    }

    const admin = await prisma.admin.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: {
            createdAt: "desc"
          },
          where: {
            archieved: "false"
          },
          take: 10,
          include: {
            Customer: { select: { companyName: true } },
            supplier: { select: { companyName: true } },
          }
        },
        suppliers: {
          orderBy: {
            createdAt: "desc",
          },
          omit: { password: true },
          take: 10,
        },
        clients: {
          orderBy: [
            { createdAt: "desc" },
            { id: "asc" },
          ],
          omit: { password: true },
          take: 10,
        },
        employees: {
          orderBy: {
            createdAt: "desc",
          },
          omit: { password: true },
          take: 10,
          where: {
            archieved: "false"
          }
        },
      },
      omit: { password: true }
    });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const activeOrders = admin.orders
      .map((order) => ({
        ...order,
        state: orderStateMap[order.state] || order.state,
        startDate: new Date(order.startDate).toLocaleDateString(),
        endDate: new Date(order.endDate).toLocaleDateString(),
        advancePayment: Number(order.advancePayment).toFixed(2),
        withholdingAmount: Number(order.withholdingAmount).toFixed(2),
        workAmount: Number(order.workAmount).toFixed(2),
        dipositRecovery: Number(order.dipositRecovery).toFixed(2),
        iva: Number(order.iva).toFixed(2),
        customerName: order.Customer?.companyName || null,
        supplierName: order.supplier?.companyName || null,
      }))
      .map(({ Customer, supplier, ...rest }) => rest);
    admin.employees = admin.employees.map((emp)=>({
      ...emp,
      startDate: new Date(emp.startDate).toLocaleDateString(),
      endDate: new Date(emp.endDate).toLocaleDateString(),
      role: EmpRoles[emp.role] || emp.role,
    }))  

    return res.status(200).json({
      data: { ...admin, orders: activeOrders },
      message: "Found",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.status(200).json({ message: "logout successfull" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}; //optional

// export const apiController = async (req, res) => {
//   try {
//     const { method, endpoint, payload, authToken } = req.body;
//     if (!method || !endpoint)
//       return res.status(400).json({ message: "Missing required fields" });

//     const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
//     if (!validMethods.includes(method))
//       return res.status(400).json({ message: "Invalid method" });

//     if (!isValidURL(endpoint))
//       return res.status(400).json({ message: "Invalid endpoint URL" });

//     const makeApiCall = async (method, endpoint, payload, token) => {
//       try {
//         const config = {
//           method,
//           url: endpoint,
//           data: payload,
//           headers: {
//             Authorization: token ? `Bearer ${token}` : "",
//             "Content-Type": "application/json",
//           },
//           withCredentials: true,
//         };
//         const response = await axios(config);
//         return { data: response.data, success: true };
//       } catch (error) {
//         return {
//           error: error.message,
//           errorCode: error.code,
//           success: false,
//         };
//       }
//     };

//     const executeNestedCalls = async (payload) => {
//       if (!Array.isArray(payload)) {
//         return await makeApiCall(method, endpoint, payload, authToken);
//       }

//       const results = [];
//       for (const request of payload) {
//         const { method, endpoint, payload: nestedPayload } = request;
//         if (!method || !endpoint) continue;
//         const result = await makeApiCall(
//           method,
//           endpoint,
//           nestedPayload,
//           authToken
//         );
//         results.push(result);
//       }
//       return results;
//     };

//     const result = await executeNestedCalls(payload);
//     return res.status(result.success ? 200 : 500).json(result);
//   } catch (error) {
//     console.error("API Error:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const isValidURL = (url) => {
//   try {
//     new URL(url);
//     return true;
//   } catch (e) {
//     return false;
//   }
// };
