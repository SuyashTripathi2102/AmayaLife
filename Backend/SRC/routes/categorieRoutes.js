const express = require('express');
const userCategories = require('../controllers/categoriesControllers');
const roleBaseAuth = require('../middlewares/roleBasedAuth');
const authentication = require('../middlewares/authentication')
const router = express.Router();

router.get('/categories',userCategories.getAllCategories);
router.get('/categories/:id',userCategories.getCategorybyId);
router.put('/categories/:id',authentication,roleBaseAuth('admin'),userCategories.updateCategorybyId);
router.post('/categories',authentication,roleBaseAuth('admin'),userCategories.postCategories);
router.delete('/categories/:id',authentication,roleBaseAuth('admin'),userCategories.deleteCategoriesbyId);
module.exports = router;