/**
 * @desc    Standard API response class
 */
class ApiResponse {
    constructor(statusCode, data, message = 'Success', success = true) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = success;
    }

    static success(res, data, message = 'Operation successful', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            meta: {}
        });
    }

    static error(res, message = 'Operation failed', statusCode = 500, error = {}) {
        return res.status(statusCode).json({
            success: false,
            message,
            error: {
                code: error.code || 'INTERNAL_SERVER_ERROR',
                details: error.details || {}
            }
        });
    }
}

module.exports = ApiResponse;
