// review Validator
const { check } = require("express-validator");

const validatorMiddleware = require("../../middleWares/validatorMiddleware");

const Review = require("../../models/reviewsModel");

exports.CreateReviewValidator = [
  check("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be a number")
    .isLength({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5 characters"),

  check("title")
    .optional()
    .isLength({ min: 3, max: 32 })
    .withMessage("Title must be between 3 and 32 characters"),
  check("product")
    .notEmpty()
    .withMessage("Product is required")
    .isMongoId()
    .withMessage("Invalid ProductId format")
    .custom((value, { req }) =>
      Review.findOne({ product: value, user: req.user._id }).then((review) => {
        if (review) {
          return Promise.reject(new Error("You already reviewed this product"));
        }
        return true;
      })
    ),
  check("user")
    .notEmpty()
    .withMessage("User is required")
    .isMongoId()
    .withMessage("Invalid UserId format"),
  validatorMiddleware,
];

exports.UpdateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid review ID format")
    .custom((value, { req }) =>
      Review.findById(value).then((review) => {
        if (!review) {
          return Promise.reject(new Error(`No review found with ID ${value}`));
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error("You are not authorized to update this review")
          );
        }
        return true;
      })
    ),

  check("rating")
    .optional()
    .isNumeric()
    .withMessage("Rating must be a number")
    .isLength({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5 characters"),
  check("title")
    .optional()
    .isLength({ min: 3, max: 32 })
    .withMessage("Title must be between 3 and 32 characters"),

  validatorMiddleware,
];

exports.DeleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid review ID format")
    .custom((value, { req }) => {
      if (req.user.role === "user") {
        return Review.findById(value).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`No review found with ID ${value}`)
            );
          }
          if (!review.user._id.equals(req.user._id)) {
            return Promise.reject(
              new Error("You are not authorized to delete this review")
            );
          }
          return true;
        });
      }
      return true;
    }),

  validatorMiddleware,
];

exports.GetReviewValidator = [
  check("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Invalid ReviewId format"),
  validatorMiddleware,
];
