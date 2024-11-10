// subCategoryRouter
const express = require("express");
const {
  creatSubCategory,
  getSubCategories,
  getOneSubCategory,
  updateSubCategory,
  deleteSubCategory,
  createFilterObject,
  setCategoryIdToBody,
} = require("../services/subCategoryService");
const {
  CreateSubCategoryValidator,
  UpdateSubCategoryValidator,
  DeleteSubCategoryValidator,
  GetSubCategoryValidator,
} = require("../utlis/validator/subCategoryValidator");
const authServices = require("../services/authServices");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    setCategoryIdToBody,
    CreateSubCategoryValidator,
    creatSubCategory
  )
  .get(createFilterObject, getSubCategories);

router
  .route("/:id")
  .get(GetSubCategoryValidator, getOneSubCategory)
  .put(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    UpdateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("admin"),
    DeleteSubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;
