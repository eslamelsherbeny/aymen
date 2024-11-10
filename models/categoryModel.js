const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide category name"],
      unique: [true, "Category name must be unique"],
      maxlength: [32, "Category name must be less than 32 characters"],
      trim: true,
      minlength: [2, "Category name must be at least 3 characters"],
    },
    image: String,
    slug: {
      type: String,
      lowercase: true,
    },
  },
  { timestamps: true }
);

const setUrlImage = (doc) => {
  if (doc.image && !doc.image.startsWith(process.env.BASE_URL)) {
    const imageUrl = `${process.env.BASE_URL}/category/${doc.image}`;
    doc.image = imageUrl;
  }
};

categorySchema.post("init", (doc) => {
  setUrlImage(doc);
});

categorySchema.post("save", (doc) => {
  setUrlImage(doc);
});

module.exports = mongoose.model("Category", categorySchema);
