const client = require('../config/twilioConfig');
const AppError = require('../utils/AppError');
const mysql = require('../config/db');
const jwt = require('jsonwebtoken');


exports.sendOtp = async (phone) => {
    if (!phone.startsWith('+')) phone = '+' + phone;
    try {
        await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
            .verifications.create({
                to: phone,
                channel: 'sms'
            });
    } catch (error) {
        throw new AppError('Failed to send OTP', 500);
    }
};


exports.verifyOtp = async (phone, code) => {
    if (!phone.startsWith('+')) phone = '+' + phone;
    try {
        const result = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
            .verificationChecks.create({
                to: phone,
                code: code
            });

        if (result.status !== 'approved') {
            throw new AppError('Invalid or expired OTP', 400);
        }
        const phoneForDb = phone.slice(-10);
        const [users] = await mysql.query('SELECT * FROM users WHERE phoneNo = ?', [phoneForDb]);
        if (users.length === 0) {
            throw new AppError('No account found with this phone number', 404);
        }
        const user = users[0];

        const Accesstoken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        const Refershtoken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return { Accesstoken, Refershtoken, user: { id: user.id, email: user.email, role: user.role } };

    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('OTP verification failed', 500);
    }
};
