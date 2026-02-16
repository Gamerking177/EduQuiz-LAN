const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode)
    .json({
      success: true,
      message, data
    },);
};

const sendError = (res, message, statusCode = 500, error = null) => {
  const response = { success: false, message };
  if (process.env.NODE_ENV === "development" && error) {
    response.error = error.toString();
  }
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
