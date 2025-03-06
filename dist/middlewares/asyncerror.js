"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsyncError = void 0;
const catchAsyncError = (fn) => (req, res, next) => {
    return fn(req, res, next).catch(next);
};
exports.catchAsyncError = catchAsyncError;
