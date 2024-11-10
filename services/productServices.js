// product Services
const slugify = require("slugify");
const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const ApiFeatures = require("../utlis/apiFeatures");
const ProductModel = require("../models/productModel");
const FactoryHandler = require("./factoryHandler");
const { uploadMixOfImages } = require("../middleWares/uploadImageMiddleware");

exports.uploadProductImage = uploadMixOfImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

exports.reSizeImage = async (req, res, next) => {
  const uploadPath = path.join(__dirname, "../Uploads/Products");

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  if (req.files.imageCover) {
    try {
      const imageCoverName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(path.join(uploadPath, imageCoverName));

      req.body.imageCover = imageCoverName;
    } catch (err) {
      return next(new Error(`Failed to process image upload: ${err.message}`));
    }

    if (req.files.images) {
      req.body.images = [];

      try {
        await Promise.all(
          req.files.images.map(async (file, index) => {
            const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
            await sharp(file.buffer)
              .resize(2000, 1333)
              .toFormat("jpeg")
              .jpeg({ quality: 90 })
              .toFile(path.join(uploadPath, imageName));

            req.body.images.push(imageName);
          })
        );
      } catch (err) {
        return next(
          new Error(`Failed to process image upload: ${err.message}`)
        );
      }
    }
  }

  next();
};

exports.getProduct = FactoryHandler.getAll(ProductModel);

exports.createProduct = FactoryHandler.createOne(ProductModel);

exports.getOneProduct = FactoryHandler.getOne(ProductModel, "reviews");

exports.updateProduct = FactoryHandler.updateOne(ProductModel);

exports.deleteProduct = FactoryHandler.deleteOne(ProductModel);
