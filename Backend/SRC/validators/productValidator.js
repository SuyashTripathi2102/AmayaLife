const Joi = require('joi');

exports.addProductSchema = Joi.object({
    name:           Joi.string().min(2).max(100).required(),
    price:          Joi.number().positive().required(),
    description:    Joi.string().min(5).required(),
    stock_quantity: Joi.number().integer().min(0).required(),
    category_id:    Joi.number().integer().required()
});

exports.updateProductSchema = Joi.object({
    name:           Joi.string().min(2).max(100).required(),
    price:          Joi.number().positive().required(),
    description:    Joi.string().min(5).required(),
    stock_quantity: Joi.number().integer().min(0).required(),
    category_id:    Joi.number().integer().required()
});

exports.patchProductSchema = Joi.object({
    name:           Joi.string().min(2).max(100).optional(),
    price:          Joi.number().positive().optional(),
    description:    Joi.string().min(5).optional(),
    stock_quantity: Joi.number().integer().min(0).optional(),
    category_id:    Joi.number().integer().optional(),
    is_active:      Joi.boolean().optional()
});