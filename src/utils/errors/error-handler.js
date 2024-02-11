const { CustomError } = require('#errors');

/**
 * Custom error handler middleware
 * @param {CustomError} err
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Express.Response} next
 * @returns
 */
const errorHandling = (err, req, res, next) => {
  if (!(err instanceof CustomError)) {
    console.log(err);
  }
  return res.status(err.statusCode || 500).json({
    message:
      process.env.NODE_ENV === 'production' && err.statusCode > 499
        ? 'Something went wrong in server'
        : err.message,
    success: false
  });
};

module.exports = errorHandling;
