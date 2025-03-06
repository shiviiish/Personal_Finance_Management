import express from "express";
import { addTransaction, getTransactions, updateTransaction, deleteTransaction} from "../controller/transactionController";
const { generateTransactionPDF } = require("../controller/transactionController");
import { isAuthorized } from "../middlewares/AuthMiddleware";
const router = express.Router();

// Protect all transaction routes with authentication middleware
router.post("/",isAuthorized as any, addTransaction);
router.get("/:id",isAuthorized as any, getTransactions);
router.put("/:id",isAuthorized as any, updateTransaction);
router.delete("/:id",isAuthorized as any, deleteTransaction);
router.get("/download/:type",isAuthorized as any, generateTransactionPDF);

export default router;
