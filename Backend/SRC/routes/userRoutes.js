const express = require('express');
const userControllers = require('../controllers/userControllers');
const authMiddleware = require('../middlewares/authentication');
const roleBasedAuth = require('../middlewares/roleBasedAuth');

const router = express.Router();

router.post('/register', userControllers.registerUser);
router.post('/login', userControllers.loginUser);
router.get('/auth/verify-email',userControllers.verifyMailHandler);
router.post('/refersh-token',userControllers.refershToken);
router.post('/logout',userControllers.logout);
router.post('/forget-password',userControllers.forgetPassword);
router.post('/auth/reset-password',userControllers.resetPassword);
router.get('/getAllUsers',authMiddleware,roleBasedAuth('admin'), userControllers.getAllUsers);
router.get('/getUserbyId/:id',userControllers.getUserbyId)
router.put('/updateUserbyId/:id',userControllers.updateUserbyId);
router.patch('/partialUpdatebyId/:id',userControllers.patchUserbyId);
router.delete('/deleteUserbyId/:id',userControllers.deleteUserbyId);
module.exports = router;