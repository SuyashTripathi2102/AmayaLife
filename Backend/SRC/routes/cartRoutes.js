const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authentication');
const cartControllers = require('../controllers/cartControllers');
const validate = require('../middlewares/validate');
const { addToCartSchema, updateCartItemSchema } = require('../validators/cartValidator');

router.post('/cart/add', authMiddleware, validate(addToCartSchema), cartControllers.addToCart);
router.get('/cart', authMiddleware, cartControllers.getCart);
router.patch('/cart/items/:itemId', authMiddleware, validate(updateCartItemSchema), cartControllers.updateCartItem);
router.delete('/cart/items/:itemId', authMiddleware, cartControllers.removeCartItem);
router.delete('/cart', authMiddleware, cartControllers.clearCart);

module.exports = router;
