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
      return res.status(401).json({
        message: "L’indirizzo email inserito non è associato a GI Costruzioni",
        status: false,
      });
    }
    const verfToken = sign(
      { role: verify.role, id: verify.id },
      process.env.JWT_SECRET,
      {
        expiresIn: "3m",
      }
    );
    return res.status(200).json({
      message:
        "Ti abbiamo inviato un’e-mail per consentirti di reimpostare la password",
      token: verfToken,
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
    const admin = await prisma.admin.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: {
            updatedAt: "desc",
          },
        },
        suppliers: {
          orderBy: {
            updatedAt: "desc",
          },
        },
        clients: {
          orderBy: {
            updatedAt: "desc",
          },
        },
        employees: {
          orderBy: {
            updatedAt: "desc",
          },
        }
        // orderSeq: true,
        // customerSeq: true,
        // employeeSeq: true,
        // supplierSeq: true
      },
    });
    if (!admin) return res.status(404).json({ message: "admin not found" });

    return res.status(200).json({ data: admin, message: "found" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

// export const updateOrderSequence = async (req, res) => {
//   try {
//     const { id } = req.user;
//     const { addedColArray, visibleColArray } = req.body;
//     if (!addedColArray || !visibleColArray) {
//       return res.status(400).json({ error: "missing required fields" });
//     }
//     if (!Array.isArray(addedColArray) || !Array.isArray(visibleColArray))
//       return res.status(406).json({ error: "Invalid type" });
//     const reqOrdval = [
//       "state",
//       "description",
//       "technicalManager",
//       "siteManager",
//       "address",
//       "orderManager",
//       "code",
//       "startDate",
//       "endDate",
//       "cnceCode",
//       "withholdingAmount",
//       "workAmount",
//       "advancePayment",
//       "dipositRecovery",
//       "isPublic",
//       "iva",
//       "cup",
//       "cig",
//     ];
//     const missingField = reqOrdval.find(
//       (field) =>
//         !addedColArray.includes(field) && !visibleColArray.includes(field)
//     );

//     if (missingField) {
//       return res.status(422).json({ error: `Invalid field: ${missingField}` });
//     }
//     await prisma.ordSequence.upsert({
//       where: { adminId: id },
//       update: {
//         added_col_array: addedColArray,
//         visible_col_array: visibleColArray,
//       },
//       create: {
//         added_col_array: addedColArray,
//         visible_col_array: visibleColArray,
//         adminId: id,
//       },
//     });
//     return res.status(200).json({ message: "sequence updated!" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// export const getOrderSequence = async (req, res) => {
//   try {
//     const { id } = req.user;
//     const seq = await prisma.ordSequence.findUnique({ where: { adminId: id } });
//     if (!seq) {
//       return res.status(404).json({ message: "sequence not found", seq });
//     }
//     return res.status(200).json(seq);
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

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
