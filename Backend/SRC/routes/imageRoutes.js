const express = require('express');
const upload = require('../middlewares/cloudImageMiddleware');
const imageController = require('../controllers/cloudImageController');
const authentication = require('../middlewares/authentication');
const roleBasedAuth = require('../middlewares/roleBasedAuth');
const router = express.Router();

router.post('/products/:id/images',authentication,roleBasedAuth('admin'),upload.single('image'), imageController.uploadProductImage);

module.exports = router;