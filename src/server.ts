import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { DBconnection } from "./database/DBconnection";
import transactionRoutes from "./routes/transRoutes";

import cookieParser from "cookie-parser";

import { ErrorMiddleware } from "./middlewares/errormiddleware";

import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });
  
app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded({extended:true}));



DBconnection();

app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
