const express = require("express");
const {
  getUsers,
  creatUser,
  getOneUser,
  updateUser,
  deleteUser,
  reSizeImage,
  uploadUserImage,
  changeUserPassword,
  getLoggedUserData,
  changeMyPassword,
  updatMyData,
  unActiveMyData,
  deleteMyData,
} = require("../services/userServices");

const {
  CreateUserValidator,
  UpdateUserValidator,
  DeleteUserValidator,
  UpdateMeValidator,
  GetUserValidator,
  ChangeUserPasswordValidator,
  ChangeMyPasswordValidator,
} = require("../utlis/validator/userValidator");

const authServices = require("../services/authServices");

const router = express.Router();

router.get("/getMe", authServices.protect, getLoggedUserData, getOneUser);

router.delete("/unActiveMyData", authServices.protect, unActiveMyData);

router.delete("/deleteMyData", authServices.protect, deleteMyData);

router.put(
  "/changeMyPassword",
  authServices.protect,
  ChangeMyPasswordValidator,
  changeMyPassword
);

router.put(
  "/updateMyData",
  authServices.protect,
  UpdateMeValidator,
  updatMyData
);

router.put(
  "/changePassword/:id",
  ChangeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/")
  .post(
    authServices.protect,
    authServices.allowedTo("admin"),
    uploadUserImage,
    reSizeImage,
    CreateUserValidator,
    creatUser
  )
  .get(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    getUsers
  );

router
  .route("/:id")
  .get(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    GetUserValidator,
    getOneUser
  )
  .put(
    authServices.protect,
    authServices.allowedTo("admin"),
    UpdateUserValidator,
    updateUser
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("admin"),
    DeleteUserValidator,
    deleteUser
  );

module.exports = router;
