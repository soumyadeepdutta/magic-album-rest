/**
 * Format a standard response
 * @param {object} data either object or string
 * @param {string} message string message
 * @returns
 */
const successResponse = (data, message = 'Resource found') => {
  if (typeof data === 'string') {
    return { message: data, success: true };
  }
  return {
    data,
    message,
    success: true
  };
};

module.exports = successResponse;
