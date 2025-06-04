import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import authRouter from "./src/routes/auth.routes.js";
import orderRouter from "./src/routes/orders.routes.js";
import customerRouter from "./src/routes/customer.routes.js";
import supplierRouter from "./src/routes/supplier.routes.js";
import employeeRouter from "./src/routes/employee.routes.js";
import accountRouter  from "./src/routes/account.routes.js"
import fattureRouter  from "./src/routes/fatture.routes.js"
import margRouter  from "./src/routes/marginalita.routes.js"
import swaggerDocs from "./src/lib/swagger.js";
import { cloudinaryConfig } from "./src/lib/utils.js";
import { loggerMiddleware } from "./src/middlewares/logger.middleware.js";

const app = express();
const port = process.env.PORT || 3000;
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 200,
//   message: {message:"Too many requests, please try again later."},
// });

// Middlewares
app.set("trust proxy", 1)
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({ origin: ["http://localhost:5173","https://gi-costruzioni-fe.vercel.app"], credentials: true }));
// app.use(limiter);
app.disable("x-powered-by");
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
app.use("/api/account", accountRouter)
app.use("/api/fatture",fattureRouter)
app.use("/api/marginalita",margRouter)

swaggerDocs(app);

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
