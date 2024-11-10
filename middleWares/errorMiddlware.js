const ApiError = require("../utlis/apiErrors");

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorForProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    statusCode: err.statusCode,
    message: err.message,
  });
};

const handleJwtInvalidSignature = () => new ApiError("invalid token", 401);

const handleJwtTokenExpired = () => new ApiError("your token expired", 401);

const globalError = (err, req, res, next) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();

    if (err.name === "TokenExpiredError") err = handleJwtTokenExpired();

    sendErrorForProd(err, res);
  }
};

module.exports = globalError;
