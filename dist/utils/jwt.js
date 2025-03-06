"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (user, message, statusCode, res) => {
    // Since your schema doesn't include role, use a fixed cookie name.
    const cookieName = "userToken";
    // Create the token from the user's _id.
    const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    // Use COOKIE_EXPIRE (in days) from env, defaulting to 1 day.
    const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 1;
    const expires = new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000);
    return res
        .status(statusCode)
        .cookie(cookieName, token, {
        expires,
        httpOnly: true,
    })
        .json({
        success: true,
        message,
        user,
        token,
    });
};
exports.generateToken = generateToken;
