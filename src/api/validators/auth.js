const Joi = require('joi');

exports.loginValidator = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required()
});
