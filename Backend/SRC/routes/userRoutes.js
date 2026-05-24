const express = require('express');
const userControllers = require('../controllers/userControllers');
const authMiddleware = require('../middlewares/authentication');
const roleBasedAuth = require('../middlewares/roleBasedAuth');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/userValidator');
const csrfProtection = require('../middlewares/csrfProtection');



const router = express.Router();

router.post('/register', validate(registerSchema), userControllers.registerUser);
router.post('/login', validate(loginSchema), userControllers.loginUser);
router.get('/auth/verify-email',userControllers.verifyMailHandler);
router.post('/refersh-token',userControllers.refershToken);
router.post('/logout',csrfProtection,userControllers.logout);
router.post('/forget-password',csrfProtection,validate(forgotPasswordSchema), userControllers.forgetPassword);
router.post('/auth/reset-password',csrfProtection,validate(resetPasswordSchema), userControllers.resetPassword);
router.get('/getAllUsers',authMiddleware,roleBasedAuth('admin'), userControllers.getAllUsers);
router.get('/getUserbyId/:id',userControllers.getUserbyId)
router.put('/updateUserbyId/:id',userControllers.updateUserbyId);
router.patch('/partialUpdatebyId/:id',userControllers.patchUserbyId);
router.delete('/deleteUserbyId/:id',userControllers.deleteUserbyId);


router.get('/auth/google', userControllers.googleAuthStartHandler);
router.get('/auth/google/callback', userControllers.googleAuthCallbackHandler);
module.exports = router;