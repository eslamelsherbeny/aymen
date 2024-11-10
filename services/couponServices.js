// coupon Services
const FactoryHandler = require("./factoryHandler");
const CouponModel = require("../models/couponModel");

exports.getCoupon = FactoryHandler.getAll(CouponModel);

exports.creatCoupon = FactoryHandler.createOne(CouponModel);

exports.getOneCoupon = FactoryHandler.getOne(CouponModel);

exports.updateCoupon = FactoryHandler.updateOne(CouponModel);

exports.deleteCoupon = FactoryHandler.deleteOne(CouponModel);
