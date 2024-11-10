// cart swrvices
const asyncHandler = require("express-async-handler");
const CartModel = require("../models/cartModel");
const ProductModel = require("../models/productModel");
const Coupon = require("../models/couponModel");

const ApiError = require("../utlis/apiErrors");

const calcCartItems = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;

  const product = await ProductModel.findById(productId);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  let cart = await CartModel.findOne({ user: req.user._id });

  if (!cart) {
    cart = await CartModel.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,

          price: product.price,
          color,
        },
      ],
    });
  } else {
    const productindex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );

    if (productindex > -1) {
      const cartitem = cart.cartItems[productindex];
      cartitem.quantity += 1;
      cart.cartItems[productindex] = cartitem;
    } else {
      cart.cartItems.push({
        product: productId,
        price: product.price,
        color,
      });
    }
  }

  calcCartItems(cart);

  await cart.save();

  res
    .status(201)
    .json({ status: "success", message: "Product added to cart", data: cart });
});

exports.getUserCart = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Cart data",
    cartLength: cart.cartItems.length,
    data: cart,
  });
});

exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.id } },
    },
    { new: true }
  );

  calcCartItems(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Cart data",
    cartLength: cart.cartItems.length,
    data: cart,
  });
});

exports.clearUserCart = asyncHandler(async (req, res, next) => {
  await CartModel.findOneAndDelete({ user: req.user._id });

  res.status(204).send();
});

exports.specificCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await CartModel.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }
  const productindex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.id
  );
  if (productindex > -1) {
    const cartitem = cart.cartItems[productindex];
    cartitem.quantity = quantity;
    cart.cartItems[productindex] = cartitem;
  } else {
    return next(new Error(`there is no product with id: ${req.params.id}`));
  }
  calcCartItems(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Cart data",
    cartLength: cart.cartItems.length,
    data: cart,
  });
});

exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const { coupon } = req.body;

  const validCoupon = await Coupon.findOne({
    name: coupon,
    expire: { $gte: Date.now() },
  });
  if (!validCoupon) {
    return next(new Error("Invalid coupon"));
  }

  const cart = await CartModel.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }
  const totalPrice = cart.totalCartPrice;

  const discount = (
    totalPrice -
    (totalPrice * validCoupon.discount) / 100
  ).toFixed(2);

  cart.totalPriceAfterDiscount = discount;

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Cart data",
    cartLength: cart.cartItems.length,
    data: cart,
  });
});
