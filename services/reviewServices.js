// review Services
const FactoryHandler = require("./factoryHandler");

const ReviewyModel = require("../models/reviewsModel");

exports.setProductIdToBody = async (req, res, next) => {
  if (!req.body.product) {
    req.body.product = req.params.productId;
    req.body.user = req.user._id;
  }

  next();
};

exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };

  req.filterObject = filterObject;
  next();
};
exports.getReviews = FactoryHandler.getAll(ReviewyModel);

exports.creatReview = FactoryHandler.createOne(ReviewyModel);

exports.getOneReview = FactoryHandler.getOne(ReviewyModel);

exports.updateReview = FactoryHandler.updateOne(ReviewyModel);

exports.deleteReview = FactoryHandler.deleteOne(ReviewyModel);
