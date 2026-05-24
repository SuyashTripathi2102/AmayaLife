const express =  require('express');
const router = express.Router();
const roleBasedAuth = require('../middlewares/roleBasedAuth');
const authentication = require ('../middlewares/authentication');
const productsController = require('../controllers/productsControllers');
const validate = require('../middlewares/validate');
const { addProductSchema, updateProductSchema, patchProductSchema } = require('../validators/productValidator');


router.get('/admin/products',authentication,roleBasedAuth('admin'),productsController.getAllProducts);// pagination
router.post('/products',authentication,roleBasedAuth('admin'),validate(addProductSchema),productsController.addNewProducts);

router.get('/products/:id',productsController.getProductbyId); 
router.put('/products/:id',authentication,roleBasedAuth('admin'),validate(updateProductSchema),productsController.updateProductbyId);
router.patch('/products/:id',authentication,roleBasedAuth('admin'),validate(patchProductSchema),productsController.patchProductbyId);
router.delete('/products/:id',authentication,roleBasedAuth('admin'),productsController.deleteProductbyId);
router.get('/products',productsController.getAllActiveProducts);
router.patch('/SoftDeleteproducts/:id/deactivate',authentication,roleBasedAuth('admin'),productsController.SoftDeleteProductbyId);//soft delete


module.exports = router;