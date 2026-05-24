const Joi = require('joi');

exports.addToCartSchema = Joi.object({
    product_id: Joi.number().integer().required(),
    quantity:   Joi.number().integer().min(1).required()
});

exports.updateCartItemSchema = Joi.object({
    quantity: Joi.number().integer().min(1).required()
});