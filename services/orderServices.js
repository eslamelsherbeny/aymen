// order services
const asyncHandler = require("express-async-handler");

const stripe = require("stripe")(
  "sk_test_51QJabJHCDjFVghwlSpM4Ia9VMRPRT5LbQJMNRTGVR2p9ms9jFF8BJwtjN2OlxR7MVHdwPBh0Ux9pWYGpVqRdSKbJ00E7Xb2HjB"
);

const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");
const CartModel = require("../models/cartModel");
const FactoryHandler = require("./factoryHandler");
const ApiError = require("../utlis/apiErrors");

exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;
  const taxPrice = 0;
  const shippingPrice = 0;

  const cart = await CartModel.findById(req.params.id);
  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  const totalPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = totalPrice + taxPrice + shippingPrice;

  const order = await OrderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice,
  });

  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));

    await ProductModel.bulkWrite(bulkOption, {});
    await CartModel.findByIdAndDelete(req.params.id);
  }

  res.status(200).json({
    status: "success",
    data: order,
    message: "Order placed successfully",
  });
});

exports.orderFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.user.role === "user") filterObject = { user: req.user._id };

  req.filterObject = filterObject;
  next();
};

exports.getOrders = FactoryHandler.getAll(OrderModel);

exports.getOneOrder = FactoryHandler.getOne(OrderModel);

exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(new ApiError("Order not found", 404));
  }
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({
    status: "success",
    data: updatedOrder,
    message: "Order delivered successfully",
  });
});

exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return next(new ApiError("Order not found", 404));
  }
  order.isPaid = true;
  order.paidAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({
    status: "success",
    data: updatedOrder,
    message: "Order paid successfully",
  });
});

exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;
  const taxPrice = 0;
  const shippingPrice = 0;

  const cart = await CartModel.findById(req.params.id);
  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  const totalPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = totalPrice + taxPrice + shippingPrice;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: "Total Order Price",
          },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/order`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    client_reference_id: req.params.id,
    customer_email: req.user.email,
    metadata: shippingAddress,
  });

  res.status(200).json({
    status: "success",
    data: session,
    url: session.url,
  });
});