// review  Router
const express = require("express");

const {
  getReviews,
  creatReview,
  getOneReview,
  updateReview,
  deleteReview,
  setProductIdToBody,
  createFilterObject,
} = require("../services/reviewServices");

const {
  CreateReviewValidator,
  UpdateReviewValidator,
  DeleteReviewValidator,
  GetReviewValidator,
} = require("../utlis/validator/reviewValidator");
const authServices = require("../services/authServices");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createFilterObject, getReviews)
  .post(
    authServices.protect,
    authServices.allowedTo("user"),
    setProductIdToBody,
    CreateReviewValidator,
    creatReview
  );

router
  .route("/:id")
  .get(GetReviewValidator, getOneReview)
  .put(
    authServices.protect,
    authServices.allowedTo("user"),
    UpdateReviewValidator,
    updateReview
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("user", "admin", "manager"),
    DeleteReviewValidator,
    deleteReview
  );

module.exports = router;
