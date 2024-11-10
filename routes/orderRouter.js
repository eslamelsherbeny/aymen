// order Router
const express = require("express");

const {
  createCashOrder,
  getOrders,
  getOneOrder,
  updateOrderToDelivered,
  updateOrderToPaid,
  orderFilterObject,
  createCheckoutSession,
} = require("../services/orderServices");

const authServices = require("../services/authServices");

const router = express.Router();

router.post(
  "/:id",
  authServices.protect,
  authServices.allowedTo("user"),
  createCashOrder
);

router.post(
  "/checkoutSession/:id",
  authServices.protect,
  authServices.allowedTo("user"),
  createCheckoutSession
);

router.get(
  "/",
  authServices.protect,
  authServices.allowedTo("user", "admin", "manager"),
  orderFilterObject,
  getOrders
);

router
  .route("/:id")
  .get(
    authServices.protect,
    authServices.allowedTo("user", "admin", "manager"),
    getOneOrder
  );

router
  .route("/:id/delivered")
  .put(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    updateOrderToDelivered
  );

router
  .route("/:id/paid")
  .put(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    updateOrderToPaid
  );

module.exports = router;
