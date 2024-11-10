// cart Router
const express = require("express");
const {
  addToCart,
  getUserCart,
  removeSpecificCartItem,
  clearUserCart,
  specificCartItemQuantity,
  applyCoupon,
} = require("../services/cartServices");

const authServices = require("../services/authServices");

const router = express.Router();

router.use(authServices.protect, authServices.allowedTo("user"));

router.put("/applyCoupon", applyCoupon);

router.route("/").post(addToCart).get(getUserCart).delete(clearUserCart);

router
  .route("/:id")
  .delete(removeSpecificCartItem)
  .put(specificCartItemQuantity);

module.exports = router;
