"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMiddleware = void 0;
class ErrorHandler extends Error {
    constructor(message, statuscode) {
        super(message);
        this.statuscode = statuscode;
        Object.setPrototypeOf(this, ErrorHandler.prototype); // Necessary when extending built-ins
    }
}
const ErrorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statuscode = err.statuscode || 500;
    if (err.name === "JsonWebTokenError") {
        const message = "JSON Web Token is Invalid";
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "TokenExpiredError") {
        const message = "JSON Web Token is Expired";
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "CastError") {
        const message = `Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400);
    }
    const errorMsg = err.errors
        ? Object.values(err.errors)
            .map((error) => error.message)
            .join(" ")
        : err.message;
    return res.status(err.statuscode).json({
        success: false,
        message: errorMsg,
    });
};
exports.ErrorMiddleware = ErrorMiddleware;
exports.default = ErrorHandler;
