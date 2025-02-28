import "dotenv/config";
import express from "express";
import authRouter from "./src/routes/auth.routes.js";
import orderRouter from "./src/routes/orders.routes.js";
import customerRouter from "./src/routes/customer.routes.js";
import supplierRouter from "./src/routes/supplier.routes.js";
import employeeRouter from "./src/routes/employee.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerDocs from "./src/lib/swagger.js";
import { cloudinaryConfig } from "./src/lib/utils.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: ["http://localhost:5173","http://localhost:5174","https://gi-costruzioni-fe.vercel.app"], credentials: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

cloudinaryConfig()

app.use("/api/auth", authRouter);
app.use("/api/order", orderRouter);
app.use("/api/customer", customerRouter);
app.use("/api/supplier", supplierRouter);
app.use("/api/employee", employeeRouter)

swaggerDocs(app);

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
