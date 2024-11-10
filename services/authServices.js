const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel");
const { uploadSingleImage } = require("../middleWares/uploadImageMiddleware");
const sendEmail = require("../utlis/sendEmail");

const ApiError = require("../utlis/apiErrors");

const creatToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRE_DATE,
  });

exports.signup = asyncHandler(async (req, res, next) => {
  const user = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    profileImg: req.body.profileImg,
    phone: req.body.phone,
    password: req.body.password,
    slug: req.body.slug,
  });

  if (!user) {
    return next(new ApiError("failed to create user", 400));
  }
  const token = creatToken(user._id);
  res.status(201).json({ data: user, token: token });
});

exports.login = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user || !(await bycrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("invalid email or password", 400));
  }
  const token = creatToken(user._id);
  res.status(201).json({ data: user, token: token });
});

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError(
        "you are not logged in please login to access this route",
        401
      )
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await UserModel.findById(decoded.userId);

  if (!currentUser) {
    return next(
      new ApiError("the user belonging to this token does not exist", 401)
    );
  }

  if (currentUser.passwordChangedAt) {
    const changedPass = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (changedPass > decoded.iat) {
      return next(
        new ApiError("user recently changed password please login again", 401)
      );
    }
  }
  req.user = currentUser;
  next();
});

// spread operator [admin, user]

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("you are not allowed to perform this action", 403)
      );
    }
    next();
  });

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("user not found", 404));
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedCode;

  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  user.passwordResetVerified = false;

  await user.save();
  const message = ` Hello ${user.name} \n your reset code is ${resetCode} \n if you didn't request for this please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: "reset password (valid for 10 minutes)",
      message: message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new ApiError("failed to send email", 500));
  }

  res.status(200).json({
    status: "success",
    message: "email sent successfully",
  });
});

exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  const hashedCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const user = await UserModel.findOne({
    passwordResetCode: hashedCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("invalid reset code or expired", 400));
  }
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "valid reset code",
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({
    email: req.body.email,
  });
  if (!user) {
    return next(new ApiError("user not found", 400));
  }

  if (!user.passwordResetVerified) {
    return next(new ApiError("invalid reset code", 400));
  }
  user.password = req.body.password;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  const token = creatToken(user._id);
  res.status(200).json({
    status: "success",
    token: token,
    message: "password changed successfully",
  });
});

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
