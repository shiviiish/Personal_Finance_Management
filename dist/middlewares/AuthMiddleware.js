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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthorized = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserSchema_1 = require("../models/UserSchema");
const isAuthorized = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        console.log(token);
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
        req.user = yield UserSchema_1.User.findById(decoded.id).select("-password");
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
        }
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: `${error}` });
    }
});
exports.isAuthorized = isAuthorized;
exports.default = exports.isAuthorized;
