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
const userModel = require("../models/userModel");

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

const createCardOrder = async (session, next) => {
  try {
    const cartId = session.client_reference_id;
    const shippingAddress = session.metadata;
    const orderPrice = session.amount_total / 100;
    const customerEmail = session.customer_email;

    if (!cartId || !customerEmail) {
      console.error("Missing necessary data for creating order.");
      return;
    }

    const cart = await CartModel.findById(cartId);
    const user = await userModel.findOne({ email: customerEmail });

    if (!cart) {
      console.error("Cart not found");
      return next(new ApiError("Cart not found", 404));
    }

    if (!user) {
      console.error("User not found");
      return next(new ApiError("User not found", 404));
    }

    const order = await OrderModel.create({
      user: user._id,
      cartItems: cart.cartItems,
      shippingAddress,
      totalOrderPrice: orderPrice,
      isPaid: true,
      paidAt: Date.now(),
      paymentMethodType: "Card",
    });

    if (order) {
      const bulkOption = cart.cartItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        },
      }));
      await ProductModel.bulkWrite(bulkOption, {});

      await CartModel.findByIdAndDelete(cartId);
    }
  } catch (error) {
    console.error("Error creating order:", error);
  }
};

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  console.log("Webhook received:", req.body);

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      "whsec_laAwwXcTpTHOvd52CkxxKGR0jkfpOCOf"
    );
    console.log("Webhook verified:", event.id);
  } catch (err) {
    console.log("Webhook Error:", err.message);
    return res
      .status(400)
      .send(`Webhook Error-------------------------: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    console.log("Webhook completed -------:");
    createCardOrder(event.data.object, next);
  }

  res.status(200).json({ received: true });
});
