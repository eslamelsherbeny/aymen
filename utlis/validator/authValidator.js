// userValidator
const { check } = require("express-validator");

const slugify = require("slugify");
const bycrypt = require("bcryptjs");
const validatorMiddleware = require("../../middleWares/validatorMiddleware");

const User = require("../../models/userModel");

exports.SignupValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 characters")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),

  check("email")
    .isEmail()
    .withMessage("Must be a valid email address")
    .custom((value, { req }) =>
      User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email already exists"));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((value, { req }) => {
      if (value !== req.body.passwordConfirm) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Confirm Password is required"),

  check("profileImg").optional(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-SA", "ar-EG"])
    .withMessage("Must be a valid phone number"),

  validatorMiddleware,
];

exports.LoginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  validatorMiddleware,
];

// exports.UpdateUserValidator = [
//   check("name")
//     .optional()
//     .notEmpty()
//     .withMessage("Name is required")
//     .isLength({ min: 3, max: 32 })
//     .withMessage("Name must be between 3 and 32 characters")
//     .custom((value, { req }) => {
//       req.body.slug = slugify(value);
//       return true;
//     }),
//   check("email")
//     .optional()
//     .isEmail()
//     .withMessage("Must be a valid email address")
//     .custom((value, { req }) =>
//       User.findOne({ email: value }).then((user) => {
//         if (user) {
//           return Promise.reject(new Error("Email already exists"));
//         }
//       })
//     ),
//   check("id")
//     .notEmpty()
//     .withMessage("Id is required")
//     .isMongoId()
//     .withMessage("Invalid UserId format"),
//   validatorMiddleware,
// ];

// exports.ChangeUserPasswordValidator = [
//   check("id")
//     .notEmpty()
//     .withMessage("Id is required")
//     .isMongoId()
//     .withMessage("Invalid UserId format"),
//   check("currentPassword")
//     .notEmpty()
//     .withMessage("Current Password is required"),
//   check("passwordConfirm")
//     .notEmpty()
//     .withMessage("Confirm Password is required"),
//   check("password")
//     .notEmpty()
//     .withMessage("Password is required")
//     .isLength({ min: 6 })
//     .withMessage("Password must be at least 6 characters")
//     .custom(async (value, { req }) => {
//       const user = await User.findById(req.params.id);
//       if (!user) {
//         throw new Error("User not found");
//       }

//       const isMatch = await bycrypt.compare(
//         req.body.currentPassword,
//         user.password
//       );
//       if (!isMatch) {
//         throw new Error("Current password is incorrect");
//       }
//       if (value !== req.body.passwordConfirm) {
//         throw new Error(" Passwords do not match");
//       }
//       return true;
//     }),
//   validatorMiddleware,
// ];
