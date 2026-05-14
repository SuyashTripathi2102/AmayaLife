const express = require('express');
const userCategories = require('../controllers/categoriesControllers');
const roleBaseAuth = require('../middlewares/roleBasedAuth');
const authentication = require('../middlewares/authentication')
const router = express.Router();

router.get('/categories',userCategories.getAllCategories);
router.post('/categories',authentication,roleBaseAuth('admin'),userCategories.postCategories);


module.exports = router;