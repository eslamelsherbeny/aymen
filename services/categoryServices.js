const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const FactoryHandler = require("./factoryHandler");
const CategoryModel = require("../models/categoryModel");
const { uploadSingleImage } = require("../middleWares/uploadImageMiddleware");

exports.getCategories = FactoryHandler.getAll(CategoryModel);

exports.creatCategory = FactoryHandler.createOne(CategoryModel);

exports.getOneCategory = FactoryHandler.getOne(CategoryModel);

exports.updateCategory = FactoryHandler.updateOne(CategoryModel);

exports.deleteCategory = FactoryHandler.deleteOne(CategoryModel);

exports.uploadCategoryImage = uploadSingleImage("image");

exports.reSizeImage = async (req, res, next) => {
  const fileName = `category-${uuidv4()}-${Date.now()}.jpeg`;

  const uploadPath = path.join(__dirname, "../Uploads/categories");

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  if (req.file) {
    try {
      await sharp(req.file.buffer)
        .resize(320, 240)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(path.join(uploadPath, fileName));

      req.body.image = fileName;
    } catch (error) {
      return next(
        new Error(`Failed to process image upload: ${error.message}`)
      );
    }
  }

  next();
};
