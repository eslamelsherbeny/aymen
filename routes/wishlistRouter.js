// wishList Router
const express = require("express");

const authServices = require("../services/authServices");

const {
  addToWishList,
  removeFromWishList,
  getWishList,
} = require("../services/wishlistServices");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authServices.protect, authServices.allowedTo("user"), getWishList)

  .post(authServices.protect, authServices.allowedTo("user"), addToWishList);

router
  .route("/:productId")

  .delete(
    authServices.protect,
    authServices.allowedTo("user"),
    removeFromWishList
  );

module.exports = router;
