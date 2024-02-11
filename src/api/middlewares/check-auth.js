const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('#errors');

/**
 * Check authentication and user role
 * @param {Boolean} is_master is master default is false
 * @returns
 */
module.exports = ({ is_master = false } = {}) => {
  /** @type {import("express").RequestHandler} */
  return (req, res, next) => {
    let authorization = req.header('Authorization');
    if (!authorization) throw new UnauthorizedError();

    try {
      authorization = authorization.split(' ');
      const token = authorization[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (is_master && !decoded.is_master) throw new ForbiddenError();
      req.authUser = decoded;
      next();
    } catch (err) {
      if (err instanceof ForbiddenError) throw new ForbiddenError();
      throw new UnauthorizedError();
    }
  };
};
