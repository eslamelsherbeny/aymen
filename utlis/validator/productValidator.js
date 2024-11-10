// productValidator
const slugify = require("slugify");

const { check } = require("express-validator");

const validatorMiddleware = require("../../middleWares/validatorMiddleware");
const CategoryModel = require("../../models/categoryModel");

const SubCategoryModel = require("../../models/subCateqoryModel");

exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Name is required")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    })
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters"),

  check("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 3, max: 2000 })
    .withMessage("Description must be between 3 and 2000 characters"),

  check("price")
    .notEmpty()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Price must be a number")
    .isLength({ min: 1, max: 32 })
    .withMessage("Price must be between 1 and 32 characters"),

  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .isLength({ min: 1, max: 32 })
    .withMessage("Price must be between 1 and 32 characters")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("product price after discount must be less than price");
      }
      return true;
    }),

  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isNumeric()
    .withMessage("Quantity must be a number")
    .isLength({ min: 1, max: 32 })
    .withMessage("Quantity must be between 1 and 32 characters"),

  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Quantity must be a number")
    .isLength({ min: 1, max: 32 })
    .withMessage("Quantity must be between 1 and 32 characters"),

  check("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid CategoryId format")
    .custom(async (value) => {
      const category = await CategoryModel.findById(value);
      if (!category) {
        throw new Error("Invalid CategoryId");
      }
      return true;
    }),
  check("subCategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid SubCategoryId format")
    .custom(async (value, { req }) => {
      const result = await SubCategoryModel.find({
        _id: { $exists: true, $in: value },
      });
      if (result.length < 1 || result.length !== value.length) {
        throw new Error("Invalid SubCategoryId");
      }
      return true;
    })
    .custom(async (value, { req }) => {
      const subCategories = await SubCategoryModel.find({
        category: req.body.category,
      });
      const subCategoryIds = subCategories.map((sub) => sub._id.toString());

      const isMatching = value.every((val) => subCategoryIds.includes(val));
      if (!isMatching) {
        throw new Error("SubCategoryId does not belong to category");
      }
      return true;
    }),

  check("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of strings"),

  check("colors")
    .optional()
    .isArray()
    .withMessage("Colors must be an array of strings"),

  check("ratingAverage")
    .optional()
    .isNumeric()
    .withMessage("RatingAverage must be a number")
    .isLength({ min: 1, max: 32 })
    .withMessage("RatingAverage must be between 1 and 32 characters"),

  check("ratingQuantity")
    .optional()
    .isNumeric()
    .withMessage("RatingQuantity must be a number")
    .isLength({ min: 1, max: 32 })
    .withMessage("RatingQuantity must be between 1 and 32 characters"),

  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id")
    .notEmpty()
    .withMessage("product id is required")
    .isMongoId()
    .withMessage("invalid product id format"),
  check("title")
    .optional()
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id")
    .notEmpty()
    .withMessage("product id is required")
    .isMongoId()
    .withMessage("invalid product id format"),
  validatorMiddleware,
];

exports.getProductValidator = [
  check("id").optional().isMongoId().withMessage("invalid product id format"),
  validatorMiddleware,
];
