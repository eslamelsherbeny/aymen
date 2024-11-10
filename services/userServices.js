const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const bycrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const FactoryHandler = require("./factoryHandler");
const UserModel = require("../models/userModel");

const { uploadSingleImage } = require("../middleWares/uploadImageMiddleware");

const ApiError = require("../utlis/apiErrors");

exports.uploadUserImage = uploadSingleImage("profileImg");

exports.reSizeImage = async (req, res, next) => {
  const fileName = `user-${uuidv4()}-${Date.now()}.jpeg`;

  const uploadPath = path.join(__dirname, "../Uploads/users");

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

      req.body.profileImg = fileName;
    } catch (error) {
      return next(
        new Error(`Failed to process image upload: ${error.message}`)
      );
    }
  }

  next();
};
const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRE_DATE,
  });

exports.getUsers = FactoryHandler.getAll(UserModel);

exports.creatUser = FactoryHandler.createOne(UserModel);

exports.getOneUser = FactoryHandler.getOne(UserModel);

exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const document = await UserModel.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role,
      phone: req.body.phone,
      slug: req.body.slug,
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(
      new ApiError(`no document found with id ${req.params.id}`, 404)
    );
  }
  await document.save();
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const document = await UserModel.findByIdAndUpdate(
    id,
    {
      password: await bycrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(
      new ApiError(`no document found with id ${req.params.id}`, 404)
    );
  }
  await document.save();
  res.status(200).json({ data: document });
});

exports.deleteUser = FactoryHandler.deleteOne(UserModel);

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

exports.updatMyData = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const user = await UserModel.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profileImg: req.body.profileImg,
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError(`no user found with id ${req.params.id}`, 404));
  }
  await user.save();
  res.status(200).json({ data: user });
});
exports.changeMyPassword = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const user = await UserModel.findByIdAndUpdate(
    id,
    {
      password: await bycrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError(`no user found with id ${req.params.id}`, 404));
  }
  await user.save();

  const token = createToken(user._id);
  res.status(200).json({ data: user, token: token });
});

exports.unActiveMyData = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const user = await UserModel.findByIdAndUpdate(
    id,
    {
      active: false,
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError(`no user found with id ${req.params.id}`, 404));
  }
  await user.save();
  res.status(200).json({ data: user });
});

exports.deleteMyData = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const user = await UserModel.findByIdAndDelete(id);

  if (!user) {
    return next(new ApiError(`No user found with id ${id}`, 404));
  }

  res.status(200).json({
    status: "success",
    message: "User data deleted successfully",
  });
});
