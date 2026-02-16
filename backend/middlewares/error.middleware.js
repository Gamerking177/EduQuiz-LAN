const { sendError } = require("../utils/response");

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err.name === "ValidationError") {
    return sendError(res, Object.values(err.errors).map(val => val.message).join(", "), 400);
  }
  if (err.code === 11000) {
    return sendError(res, "Duplicate field value entered", 400);
  }
  sendError(res, err.message || "Server Error", 500, err);
};

module.exports = errorHandler;
