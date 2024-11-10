// wishList Services
const asyncHandler = require("express-async-handler");

const ApiError = require("../utlis/apiErrors");
const User = require("../models/userModel");

exports.addToWishList = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: {
        wishList: req.body.productId,
      },
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError(`failed to add product to wishList`, 400));
  }

  res.status(200).json({
    status: "success",
    message: "product added to wishList",
    data: user.wishList,
  });
});

exports.removeFromWishList = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        wishList: req.params.productId,
      },
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError(`failed to remove product from wishList`, 400));
  }

  res.status(200).json({
    status: "success",
    message: "product removed from wishList",
    data: user.wishList,
  });
});

exports.getWishList = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishList");
  if (!user) {
    return next(new ApiError(`failed to get wishList`, 400));
  }
  res.status(200).json({
    status: "success",
    result: user.wishList.length,
    data: user.wishList,
  });
});
