import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import cors from "cors";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import stripe from "./routes/stripe.js";

//configuring dotenv
dotenv.config();

//importing db connection
connectDB();

const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
// for stripe
app.use(express.static("public"));

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/stripe", stripe);

app.get("/", (req, res) => {
  res.send("<h2>Server is ready</h2>");
});

const port = process.env.PORT;

app.listen(port, (err) => {
  if (err) {
    return console.log("something bad happened", err);
  }
  console.log(
    `Server Running on ${process.env.DEV_MODE} mode & listening on port: ${port}!`
      .bgCyan.white
  );
});
