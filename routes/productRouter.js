const express = require("express");
const {
  createProduct,
  getProduct,
  getOneProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  reSizeImage,
} = require("../services/productServices");
const {
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
  getProductValidator,
} = require("../utlis/validator/productValidator");
const reviewRouter = require("./reviewRouter");

const router = express.Router();

router.use("/:productId/reviews", reviewRouter);

router
  .route("/")
  .post(uploadProductImage, reSizeImage, createProductValidator, createProduct)
  .get(getProduct);

router
  .route("/:id")
  .get(getProductValidator, getOneProduct)
  .put(uploadProductImage, reSizeImage, updateProductValidator, updateProduct)
  .delete(deleteProductValidator, deleteProduct);

module.exports = router;
