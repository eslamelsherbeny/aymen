const express = require("express");
const {
  creatCategory,
  getCategories,
  getOneCategory,
  updateCategory,
  deleteCategory,
  reSizeImage,
  uploadCategoryImage,
} = require("../services/categoryServices");
const {
  CreateCategoryValidator,
  UpdateCategoryValidator,
  DeleteCategoryValidator,
  GetCategoryValidator,
} = require("../utlis/validator/categoryValidator");
const subCategoryRouter = require("./subCategoryRouter");
const authServices = require("../services/authServices");

const router = express.Router();

router.use("/:categoryId/subCategory", subCategoryRouter);

router
  .route("/")
  .post(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    uploadCategoryImage,
    reSizeImage,
    CreateCategoryValidator,
    creatCategory
  )
  .get(authServices.protect, getCategories);

router
  .route("/:id")
  .get(GetCategoryValidator, getOneCategory)
  .put(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    UpdateCategoryValidator,
    updateCategory
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("admin"),
    DeleteCategoryValidator,
    deleteCategory
  );

module.exports = router;
