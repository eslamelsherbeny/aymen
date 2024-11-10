// wishList Router
const express = require("express");

const authServices = require("../services/authServices");

const {
  addToAddress,
  removeAddress,
  getAddress,
} = require("../services/addressServices");

const router = express.Router();

router
  .route("/")
  .get(authServices.protect, authServices.allowedTo("user"), getAddress)

  .post(authServices.protect, authServices.allowedTo("user"), addToAddress);

router
  .route("/:addressId")
  .delete(authServices.protect, authServices.allowedTo("user"), removeAddress);

module.exports = router;
