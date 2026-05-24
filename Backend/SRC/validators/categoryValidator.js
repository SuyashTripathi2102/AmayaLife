const Joi = require('joi');

exports.categorySchema = Joi.object({
    name: Joi.string().min(2).max(50).required()
});