const express = require("express");
const {
  creatCoupon,
  getCoupon,
  getOneCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../services/couponServices");

const authServices = require("../services/authServices");

const router = express.Router();

router
  .route("/")
  .post(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    creatCoupon
  )
  .get(authServices.protect, getCoupon);

router
  .route("/:id")
  .get(getOneCoupon)
  .put(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    updateCoupon
  )
  .delete(authServices.protect, authServices.allowedTo("admin"), deleteCoupon);

module.exports = router;
