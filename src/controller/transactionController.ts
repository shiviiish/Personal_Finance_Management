import { Request, Response, NextFunction } from "express";
import { Transaction } from "../models/TransSchema";
import { catchAsyncError } from "../middlewares/asyncerror";
import Category from "../models/CategorySchema";
import { Document } from "mongoose";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

interface ITransaction extends Document {
  user: string;
  amount: number;
  category: string;
  date: Date;
  type: "income" | "expense";
  name: string;
}



export const addTransaction = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try{const {name, amount, category, date, type } = req.body;
    
    const newTransaction = new Transaction({
      user: (req as any).user.id, 
      amount,
      category,
      date,
      type,
      name
    });

    await newTransaction.save();
    res.status(201).json({
      success: true,
      message: "Transaction added successfully",
      transaction: newTransaction,
    });
  }catch (error) {
    res.status(500).json({ message: `${error}` });
  }
});



export const getTransactions = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transactions = await Transaction.find({ user: (req as any).user.id });
    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  }
);

export const updateTransaction = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const updatedData = req.body;

    const transaction = await Transaction.findByIdAndUpdate(id, updatedData, { new: true });
    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });
  }
);

export const deleteTransaction = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }
    await transaction.deleteOne();
    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  }
);

export function generateSummaryChartData(transactions: ITransaction[]) {
    let totalIncome = 0;
    let totalExpense = 0;
  
    transactions.forEach((tx) => {
      if (tx.type === "income") {
        totalIncome += tx.amount;
      } else if (tx.type === "expense") {
        totalExpense += tx.amount;
      }
    });
  
    const savings = totalIncome - totalExpense;
  
    const labels = ["Total Income", "Total Expense", "Savings"];
    const data = [totalIncome, totalExpense, savings];
  
    const pieData = { labels, data };
    const barData = { labels, data };
  
    return { totalIncome, totalExpense, savings, pieData, barData };
  }
  
  export function generateCategoryWiseExpenseChartData(transactions: ITransaction[]) {
    const categoryMap: { [category: string]: number } = {};
  
    transactions.forEach((tx) => {
      if (tx.type === "expense") {
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      }
    });
  
    const labels = Object.keys(categoryMap);
    const data = labels.map((label) => categoryMap[label]);
  
    return { labels, data };
  }


export const generateTransactionPDF = async (req:Request, res:Response) => {
    try {
        const { type } = req.params;

        let transactions = [
            { date: "2025-03-01", category: "Rent", amount: "$1000" },
            { date: "2025-03-02", category: "Groceries", amount: "$200" }
        ];
        if (type === "income") {
            transactions = [
                { date: "2025-03-01", category: "Salary", amount: "$3000" },
                { date: "2025-03-03", category: "Freelance", amount: "$500" }
            ];
        }

        const fileName = `${type}_report.pdf`;
        const filePath = path.join(__dirname, `../public/${fileName}`);

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(filePath)); // Save file
        doc.pipe(res); // Send to client

        doc.fontSize(20).text(`${type.toUpperCase()} REPORT`, { align: "center" }).moveDown();

        doc.fontSize(14).text("Date", 50, 100);
        doc.text("Category", 200, 100);
        doc.text("Amount", 400, 100);

        let y = 130;
        transactions.forEach((item) => {
            doc.fontSize(12).text(item.date, 50, y);
            doc.text(item.category, 200, y);
            doc.text(item.amount, 400, y);
            y += 30;
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: "Error generating PDF", error });
    }
};


 


