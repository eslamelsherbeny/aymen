const slugify = require("slugify");

const { check } = require("express-validator");

const validatorMiddleware = require("../../middleWares/validatorMiddleware");

exports.CreateCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    })
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters"),

  validatorMiddleware,
];

exports.UpdateCategoryValidator = [
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
    .withMessage("Invalid CategoryId format"),
  validatorMiddleware,
];

exports.DeleteCategoryValidator = [
  check("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Invalid CategoryId format"),
  validatorMiddleware,
];

exports.GetCategoryValidator = [
  check("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Invalid CategoryId format"),
  validatorMiddleware,
];
