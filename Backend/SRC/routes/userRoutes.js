const express = require('express');
const userControllers = require('../controllers/userControllers');

const router = express.Router();

router.post('/register', userControllers.registerUser);
router.post('/login', userControllers.loginUser);
router.get('/getAllUsers', userControllers.getAllUsers);
router.get('/getUserbyId/:id',userControllers.getUserbyId)
router.put('/updateUserbyId/:id',userControllers.updateUserbyId);
router.patch('/partialUpdatebyId/:id',userControllers.patchUserbyId);
router.delete('/deleteUserbyId/:id',userControllers.deleteUserbyId);
module.exports = router;