const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpControllers');

router.post('/send-otp',otpController.sendOtp);
router.post('/verify-otp',otpController.verifyOtp);

module.exports = router;