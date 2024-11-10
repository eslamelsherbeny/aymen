const multer = require("multer");
const ApiError = require("../utlis/apiErrors");

const multerOption = () => {
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("not an image", 400), false);
    }
  };
  const upload = multer({ storage: multerStorage, filter: multerFilter });

  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOption().single(fieldName);

exports.uploadMixOfImages = (arrayOfFields) =>
  multerOption().fields(arrayOfFields);
