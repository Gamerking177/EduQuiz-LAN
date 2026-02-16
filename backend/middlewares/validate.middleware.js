const { sendError } = require("../utils/response");

const validate = (schema) => (req, res, next) => {
  if (!schema) return next();
  const { error } = schema.validate(req.body);
  if (error) {
    return sendError(res, error.details[0].message, 400);
  }
  next();
};

module.exports = validate;
