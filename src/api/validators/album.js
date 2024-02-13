const Joi = require('joi');

exports.createAlbumValidator = Joi.object({
  name: Joi.string().min(2).max(100).required()
});
