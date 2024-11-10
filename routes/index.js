// mount Routes
const categoryRouter = require("./categoryRouter");
const productRouter = require("./productRouter");
const subCategoryRouter = require("./subCategoryRouter");
const userRouter = require("./userRouter");
const auth = require("./authRouter");
const reviewRouter = require("./reviewRouter");
const wishListRouter = require("./wishlistRouter");
const addressRouter = require("./addressRouter");
const couponRouter = require("./couponRouter");
const CartRouter = require("./cartRouter");
const orderRouter = require("./orderRouter");

const mountRoutes = (app) => {
  app.use("/api/v1/category", categoryRouter);
  app.use("/api/v1/subcategory", subCategoryRouter);
  app.use("/api/v1/product", productRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/auth", auth);
  app.use("/api/v1/review", reviewRouter);
  app.use("/api/v1/wishlist", wishListRouter);
  app.use("/api/v1/address", addressRouter);
  app.use("/api/v1/coupon", couponRouter);
  app.use("/api/v1/cart", CartRouter);
  app.use("/api/v1/order", orderRouter);
};

module.exports = mountRoutes;
