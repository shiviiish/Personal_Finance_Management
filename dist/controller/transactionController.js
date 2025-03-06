"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTransactionPDF = exports.deleteTransaction = exports.updateTransaction = exports.getTransactions = exports.addTransaction = void 0;
exports.generateSummaryChartData = generateSummaryChartData;
exports.generateCategoryWiseExpenseChartData = generateCategoryWiseExpenseChartData;
const TransSchema_1 = require("../models/TransSchema");
const asyncerror_1 = require("../middlewares/asyncerror");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
exports.addTransaction = (0, asyncerror_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, amount, category, date, type } = req.body;
        const newTransaction = new TransSchema_1.Transaction({
            user: req.user.id,
            amount,
            category,
            date,
            type,
            name
        });
        yield newTransaction.save();
        res.status(201).json({
            success: true,
            message: "Transaction added successfully",
            transaction: newTransaction,
        });
    }
    catch (error) {
        res.status(500).json({ message: `${error}` });
    }
}));
exports.getTransactions = (0, asyncerror_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield TransSchema_1.Transaction.find({ user: req.user.id });
    res.status(200).json({
        success: true,
        count: transactions.length,
        transactions,
    });
}));
exports.updateTransaction = (0, asyncerror_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updatedData = req.body;
    const transaction = yield TransSchema_1.Transaction.findByIdAndUpdate(id, updatedData, { new: true });
    if (!transaction) {
        res.status(404).json({ message: "Transaction not found" });
        return;
    }
    res.status(200).json({
        success: true,
        message: "Transaction updated successfully",
        transaction,
    });
}));
exports.deleteTransaction = (0, asyncerror_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const transaction = yield TransSchema_1.Transaction.findById(id);
    if (!transaction) {
        res.status(404).json({ message: "Transaction not found" });
        return;
    }
    yield transaction.deleteOne();
    res.status(200).json({
        success: true,
        message: "Transaction deleted successfully",
    });
}));
function generateSummaryChartData(transactions) {
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach((tx) => {
        if (tx.type === "income") {
            totalIncome += tx.amount;
        }
        else if (tx.type === "expense") {
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
function generateCategoryWiseExpenseChartData(transactions) {
    const categoryMap = {};
    transactions.forEach((tx) => {
        if (tx.type === "expense") {
            categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
        }
    });
    const labels = Object.keys(categoryMap);
    const data = labels.map((label) => categoryMap[label]);
    return { labels, data };
}
const generateTransactionPDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (error) {
        res.status(500).json({ message: "Error generating PDF", error });
    }
});
exports.generateTransactionPDF = generateTransactionPDF;
