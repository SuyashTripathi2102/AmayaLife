const AppError = require('../utils/AppError');

const csrfProtection = (req, res, next) => {
    const tokenFromCookie = req.cookies.csrf_token;
    const tokenFromHeader = req.headers['x-csrf-token'];

    if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
        return next(new AppError('Invalid CSRF token', 403));
    }
    next();
};

module.exports = csrfProtection;