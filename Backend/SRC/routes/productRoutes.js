const express =  require('express');
const router = express.Router();
const roleBasedAuth = require('../middlewares/roleBasedAuth');
const authentication = require ('../middlewares/authentication');
const productsController = require('../controllers/productsControllers');


router.get('/products',productsController.getAllProducts);// pagination
router.post('/products',authentication,roleBasedAuth('admin'),productsController.addNewProducts);

router.get('/products/:id',productsController.getPrdouctbyId); 
router.put('/products/:id',authentication,roleBasedAuth('admin'),productsController.updateProductbyId);
router.patch('/products/:id',authentication,roleBasedAuth('admin'),productsController.patchProductbyId);
router.delete('/products/:id',authentication,roleBasedAuth('admin'),productsController.deleteProductbyId);//soft delete


module.exports = router;