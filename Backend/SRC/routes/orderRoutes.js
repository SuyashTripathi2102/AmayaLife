const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authentication');
const orderControllers = require('../controllers/orderControllers');

router.post('/orders',authMiddleware,orderControllers.placeOrders);
router.get('/orders',authMiddleware,orderControllers.getOrders);
router.get('/orders/:id',authMiddleware,orderControllers.getOrderbyId);
router.patch('/orders/:id/cancel',authMiddleware,orderControllers.cancelOrder);
router.post('/orders/:id/initiate-payment', authMiddleware, orderControllers.initiatePayment);
router.post('/orders/webhook', orderControllers.handleWebhook);

module.exports = router;