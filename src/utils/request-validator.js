const { BadRequestError } = require('#errors');

/**
 * Validates a request with given schema before passing to requst handler
 * @param {Joi.Schema} schema Joi schema object
 * @returns
 */
function requestValidator(schema) {
  /** @type {import("express").RequestHandler} */
  return (req, res, next) => {
    const { value, error } = schema.validate(req.body);
    if (error) throw new BadRequestError(error.message);
    req.body = value;
    next();
  };
}

module.exports = requestValidator;
