const express = require("express");

const {
  signup,
  login,
  reSizeImage,
  uploadUserImage,
  forgetPassword,
  verifyResetCode,
  resetPassword,
} = require("../services/authServices");

const {
  SignupValidator,
  LoginValidator,
} = require("../utlis/validator/authValidator");

const router = express.Router();

router.post("/signup", uploadUserImage, reSizeImage, SignupValidator, signup);

router.post("/login", LoginValidator, login);

router.post("/forgetPassword", forgetPassword);

router.post("/verifyResetCode", verifyResetCode);

router.post("/resetPassword", resetPassword);

module.exports = router;
