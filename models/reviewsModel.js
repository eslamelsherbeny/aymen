// review Schema
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name ",
  });
  next();
});

reviewSchema.statics.calcAverageAndQuantityRatings = async function (
  productId
) {
  const result = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log(result);

  if (result.length > 0) {
    await this.model("Product").findByIdAndUpdate(productId, {
      ratingQuantity: result[0].nRating,
      ratingAverage: Math.round(result[0].avgRating * 10) / 10,
    });
  } else {
    await this.model("Product").findByIdAndUpdate(productId, {
      ratingQuantity: 0,
      ratingAverage: 0,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageAndQuantityRatings(this.product);
});

// query middleware
reviewSchema.post("findOneAndDelete", (doc) => {
  if (doc) {
    doc.constructor.calcAverageAndQuantityRatings(doc.product);
  }
});
module.exports = mongoose.model("Review", reviewSchema);
