import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.js";
import sellerRouter from "./routes/sellers.js";
import buyerRouter from "./routes/buyers.js";
import cors from "cors";

export const app = express();

config({ path: "./data/config.env" });

// Using middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, //need to set this true to be able to send cookies and track them
  })
);


app.get("/", (req, res) => {
  res.send("Hello, Welcome to b2b marketplace api");
});

//using routes
app.use("/api/v1/sellers", sellerRouter);
app.use("/api/v1/buyers", buyerRouter);


//using custom error middleware
app.use(errorMiddleware);