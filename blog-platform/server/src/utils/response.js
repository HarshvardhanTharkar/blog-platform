/**
 * Standardized API response helper.
 * Ensures consistent response shape across all endpoints.
 */

const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message = 'Server Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendCreated = (res, data = {}, message = 'Created successfully') => {
  return sendSuccess(res, data, message, 201);
};

module.exports = { sendSuccess, sendError, sendCreated };
