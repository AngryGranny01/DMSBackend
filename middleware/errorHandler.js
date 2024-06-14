const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const env = process.env.NODE_ENV || 'development';

    // Log the error details
    if (env === 'development') {
        console.error(err);
    } else {
        // In production, log the error to a file or external service
    }

    // Send a detailed error response
    const response = {
        status: 'error',
        statusCode: statusCode,
        message: err.message,
    };

    if (env === 'development' && statusCode === 500) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;