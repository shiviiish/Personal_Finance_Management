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
exports.loginUser = exports.verifyOTP = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserSchema_1 = require("../models/UserSchema");
const sendEmail_1 = require("../utils/sendEmail");
const asyncerror_1 = require("../middlewares/asyncerror");
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
exports.registerUser = (0, asyncerror_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstname, lastname, Email, Password, isVerified } = req.body;
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        const existingUser = yield UserSchema_1.User.findOne({ Email });
        if (existingUser) {
            if (!existingUser.isVerified) {
                existingUser.otp = otp;
                existingUser.otpExpires = otpExpires;
                yield existingUser.save();
                yield (0, sendEmail_1.sendOTP)(Email, otp);
                res
                    .status(200)
                    .json({ message: "New OTP sent. Please verify your email." });
                return;
            }
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const newUser = new UserSchema_1.User({
            firstname,
            lastname,
            Email,
            Password,
            otp,
            otpExpires,
            isVerified: false,
        });
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(Password, salt);
        yield UserSchema_1.User.create({ firstname, lastname, Email, Password: hashedPassword, otp, otpExpires });
        yield (0, sendEmail_1.sendOTP)(Email, otp);
        res.status(200).json({ message: "OTP sent to email. Please verify." });
    }
    catch (error) {
        res.status(500).json({ message: `${error}` });
    }
}));
exports.verifyOTP = (0, asyncerror_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Email, otp } = req.body;
        const user = yield UserSchema_1.User.findOne({ Email });
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        ;
        if (user.otp !== otp.toString() || new Date() > user.otpExpires) {
            res.status(400).json({ message: "Invalid or expired OTP" });
            return;
        }
        ;
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        yield user.save();
        res.status(200).json({ message: "Email verified. You can now login." });
    }
    catch (error) {
        res.status(500).json({ message: `${error}` });
    }
}));
exports.loginUser = (0, asyncerror_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Email, Password } = req.body;
        const user = yield UserSchema_1.User.findOne({ Email }).select('+Password');
        if (!user || !user.isVerified) {
            res.status(400).json({ message: "User not found or not verified" });
            return;
        }
        console.log(Password);
        console.log(user.Password);
        const isMatch = yield bcryptjs_1.default.compare(Password, user.Password);
        console.log(isMatch);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const cookieName = "userToken";
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d",
        });
        const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 1;
        const expires = new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000);
        res
            .status(200)
            .cookie(cookieName, token, {
            expires,
            httpOnly: true,
        })
            .json({
            success: true,
            message: "User logged in successfully",
            user,
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: `${error}` });
    }
}));
