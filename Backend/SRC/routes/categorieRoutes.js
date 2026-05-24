const express = require('express');
const userCategories = require('../controllers/categoriesControllers');
const roleBaseAuth = require('../middlewares/roleBasedAuth');
const authentication = require('../middlewares/authentication')
const validate = require('../middlewares/validate');
const { categorySchema } = require('../validators/categoryValidator');

const router = express.Router();

router.get('/categories',userCategories.getAllCategories);
router.get('/categories/:id',userCategories.getCategorybyId);
router.put('/categories/:id',authentication,roleBaseAuth('admin'),validate(categorySchema),userCategories.updateCategorybyId);
router.post('/categories',authentication,roleBaseAuth('admin'),validate(categorySchema),userCategories.postCategories);
router.delete('/categories/:id',authentication,roleBaseAuth('admin'),userCategories.deleteCategoriesbyId);
module.exports = router;