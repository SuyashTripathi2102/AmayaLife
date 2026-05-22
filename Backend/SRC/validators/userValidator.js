const Joi = require('joi');

exports.registerSchema = Joi.object({
    name:     Joi.string().min(2).max(50).required(),
    email:    Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phoneNo:  Joi.string().length(10).required(),
    role:     Joi.string().valid('customer', 'admin').optional()
});

exports.loginSchema = Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required()
});

exports.forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

exports.resetPasswordSchema = Joi.object({
    Newpassword: Joi.string().min(6).required()
});
