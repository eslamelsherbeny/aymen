// subcategoryServices

const SubCategoryModel = require("../models/subCateqoryModel");

const FactoryHandler = require("./factoryHandler");

exports.setCategoryIdToBody = async (req, res, next) => {
  if (!req.body.category) {
    req.body.category = req.params.categoryId;
  }

  next();
};

exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };

  req.filterObject = filterObject;
  next();
};

exports.getSubCategories = FactoryHandler.getAll(SubCategoryModel);

exports.creatSubCategory = FactoryHandler.createOne(SubCategoryModel);

exports.getOneSubCategory = FactoryHandler.getOne(SubCategoryModel);

exports.updateSubCategory = FactoryHandler.updateOne(SubCategoryModel);

exports.deleteSubCategory = FactoryHandler.deleteOne(SubCategoryModel);
