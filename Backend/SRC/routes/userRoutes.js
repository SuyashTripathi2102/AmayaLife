const express = require('express');
const userControllers = require('../controllers/userControllers');
const authMiddleware = require('../middlewares/authentication');
const roleBasedAuth = require('../middlewares/roleBasedAuth');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/userValidator');
const csrfProtection = require('../middlewares/csrfProtection');
const {authLimiter} = require('../middlewares/rateLimiter')


const router = express.Router();

router.post('/register',authLimiter,validate(registerSchema), userControllers.registerUser);
router.post('/login',authLimiter,validate(loginSchema), userControllers.loginUser);
router.get('/auth/verify-email',userControllers.verifyMailHandler);
router.post('/refersh-token',userControllers.refershToken);
router.post('/logout',csrfProtection,userControllers.logout);
router.post('/forget-password',authLimiter,csrfProtection,validate(forgotPasswordSchema), userControllers.forgetPassword);
router.post('/auth/reset-password',csrfProtection,validate(resetPasswordSchema), userControllers.resetPassword);
router.get('/getAllUsers',authMiddleware,roleBasedAuth('admin'), userControllers.getAllUsers);
router.get('/getUserbyId/:id',authMiddleware,userControllers.getUserbyId)
router.put('/updateUserbyId/:id',authMiddleware,userControllers.updateUserbyId);
router.patch('/partialUpdatebyId/:id',authMiddleware,userControllers.patchUserbyId);
router.delete('/deleteUserbyId/:id',authMiddleware,roleBasedAuth('admin'),userControllers.deleteUserbyId);


router.get('/auth/google', userControllers.googleAuthStartHandler);
router.get('/auth/google/callback', userControllers.googleAuthCallbackHandler);
module.exports = router;