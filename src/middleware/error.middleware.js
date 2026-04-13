const mongoose = require('mongoose');
const ApiError = require('../utils/customError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = err;

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate field value: ${field}. Please use another value.`;
        error = new ApiError(400, message);
    } else if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode || error instanceof mongoose.Error ? 400 : 500;
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message, err?.errors || [], err.stack);
    }

    const response = {
        success: false,
        message: error.message,
        error: {
            code: error.statusCode,
            details: error.errors || {}
        },
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    };

    logger.error(`${req.method} ${req.url} - ${error.message}`);
    return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
