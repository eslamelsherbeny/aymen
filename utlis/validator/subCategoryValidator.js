// subCategory Validator
const { check } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middleWares/validatorMiddleware");

exports.CreateSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    })
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters"),

  check("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid CategoryId format"),
  validatorMiddleware,
];

exports.UpdateSubCategoryValidator = [
  check("name")
    .optional()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Invalid SubCategoryId format"),
  validatorMiddleware,
];

exports.DeleteSubCategoryValidator = [
  check("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Invalid SubCategoryId format"),
  validatorMiddleware,
];

exports.GetSubCategoryValidator = [
  check("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Invalid SubCategoryId format"),
  validatorMiddleware,
];
