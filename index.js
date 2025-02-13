import "dotenv/config";
import express from "express";
import authRouter from "./src/routes/auth.routes.js";
import orderRouter from "./src/routes/orders.routes.js"
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerDocs from "./src/lib/swagger.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/order", orderRouter);

swaggerDocs(app)

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
