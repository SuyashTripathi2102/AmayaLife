const otpServices = require('../services/otpServices');
const { setRefreshCookie, setCsrfCookie } = require('../helper/cookieHelper');
const crypto = require('crypto');

exports.sendOtp = async (req, res, next) => {
    try {
        const { phone } = req.body;
        await otpServices.sendOtp(phone);
        res.status(200).json({
            message: 'OTP sent successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.verifyOtp = async (req, res, next) => {
    const { phone, code } = req.body;
    try {
        const data = await otpServices.verifyOtp(phone, code);
        const { Accesstoken, Refershtoken, user } = data;
        const csrfToken = crypto.randomBytes(32).toString('hex');
        setRefreshCookie(res, Refershtoken);
        setCsrfCookie(res, csrfToken);
        res.status(200).json({
            message: 'OTP verified successfully',
            Accesstoken,
            user
        });
    } catch (error) {
        next(error);
    }
};
