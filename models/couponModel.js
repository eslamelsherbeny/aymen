// couponModel
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Please provide name"],
      maxlength: [50, "Name can not be more than 50 characters"],
      minlength: [3, "Name can not be less than 3 characters"],
      lowercase: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    discount: {
      type: Number,
      required: [true, "Please provide discount"],
      min: [0, "Discount can not be less than 0"],
      max: [100, "Discount can not be more than 100"],
    },
    expire: {
      type: Date,
      required: [true, "Please provide expire date"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Coupon", couponSchema);
