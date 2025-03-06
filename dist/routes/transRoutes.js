"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transactionController_1 = require("../controller/transactionController");
const { generateTransactionPDF } = require("../controller/transactionController");
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const router = express_1.default.Router();
// Protect all transaction routes with authentication middleware
router.post("/", AuthMiddleware_1.isAuthorized, transactionController_1.addTransaction);
router.get("/", AuthMiddleware_1.isAuthorized, transactionController_1.getTransactions);
router.put("/:id", AuthMiddleware_1.isAuthorized, transactionController_1.updateTransaction);
router.delete("/:id", AuthMiddleware_1.isAuthorized, transactionController_1.deleteTransaction);
router.get("/download/:type", AuthMiddleware_1.isAuthorized, generateTransactionPDF);
exports.default = router;
