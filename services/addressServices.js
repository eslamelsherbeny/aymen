// wishList Services
const asyncHandler = require("express-async-handler");

const ApiError = require("../utlis/apiErrors");
const User = require("../models/userModel");

exports.addToAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: {
        address: req.body,
      },
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError(`failed to add address `, 400));
  }

  res.status(200).json({
    status: "success",
    message: "address added successfully",
    data: user.address,
  });
});

exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        address: { _id: req.params.addressId },
      },
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError(`failed to remove address`, 400));
  }

  res.status(200).json({
    status: "success",
    message: "address removed successfully",
    data: user.address,
  });
});

exports.getAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("address");
  if (!user) {
    return next(new ApiError(`failed to get address`, 400));
  }
  res.status(200).json({
    status: "success",
    result: user.address.length,
    data: user.address,
  });
});
