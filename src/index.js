import "dotenv/config";
import express from "express";
import authRouter from "./routes/auth.routes.js";
import orderRouter from "./routes/orders.routes.js";
import customerRouter from "./routes/customer.routes.js";
import supplierRouter from "./routes/supplier.routes.js";
import employeeRouter from "./routes/employee.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerDocs from "./lib/swagger.js";
import { cloudinaryConfig } from "./lib/utils.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.set("trust proxy", 1)
app.use(cors({ origin: ["http://localhost:5173","https://gi-costruzioni-fe.vercel.app"], credentials: true }));
app.use(loggerMiddleware)
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

cloudinaryConfig()

// Routes
app.get("/", (req, res) => {
  res.send("Ciao mondo!");
});
app.use("/api/auth", authRouter);
app.use("/api/order", orderRouter);
app.use("/api/customer", customerRouter);
app.use("/api/supplier", supplierRouter);
app.use("/api/employee", employeeRouter)

swaggerDocs(app);

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
