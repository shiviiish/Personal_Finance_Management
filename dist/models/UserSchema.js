"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const UserSchema = new mongoose_1.default.Schema({
    firstname: {
        type: String,
        required: true,
        minlength: [3, "First name must contain at least 3 characters"],
    },
    lastname: {
        type: String,
        required: true,
        minlength: [3, "last name must contain at least 3 characters"],
    },
    Email: {
        type: String,
        validate: [validator_1.default.isEmail, "Please provide a valid email"]
    },
    Password: {
        type: String,
        required: true,
        select: false,
        minlength: [8, "Password must contain  at least 8 characters"]
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});
exports.User = mongoose_1.default.model("User", UserSchema);
