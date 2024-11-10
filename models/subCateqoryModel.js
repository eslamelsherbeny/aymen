// subcateqoryModel
const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide category name"],
      unique: [true, "Category name must be unique"],
      maxlength: [32, "Category name must be less than 32 characters"],
      trim: true,
      minlength: [2, "Category name must be at least 3 characters"],
    },

    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "category id is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubCategory", subCategorySchema);
