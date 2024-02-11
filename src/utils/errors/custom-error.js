class CustomError extends Error {
  statusCode = 500;
  constructor(message = 'Something went wrong', statusCode = 400) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
  }
}

class BadRequestError extends CustomError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends CustomError {
  constructor(message = 'Resource you are looking for is not available') {
    super(message, 404);
  }
}
class UnauthorizedError extends CustomError {
  constructor(message = 'You are unauthorized to access this resource') {
    super(message, 401);
  }
}

class ForbiddenError extends CustomError {
  constructor(message = 'You are forbidden to access this resource') {
    super(message, 403);
  }
}

class ServiceError extends CustomError {
  constructor(
    message = 'Service is not working currently. Try after some time.'
  ) {
    super(message, 503);
  }
}

module.exports = {
  CustomError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ServiceError
};
