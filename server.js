const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

const compression = require("compression");

const path = require("path");
const cors = require("cors");
const dbConnection = require("./confiq/database");
const ApiError = require("./utlis/apiErrors");
const globalError = require("./middleWares/errorMiddlware");
const mountRoutes = require("./routes");

dotenv.config();

dbConnection();

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

mountRoutes(app);

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

app.use("*", (req, res, next) => {
  next(new ApiError(`Cant't find this route ${req.originalUrl} !`, 404));
});

app.use(globalError);

app.use(cors());

app.options("*", cors());

app.use(compression());

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled rejection Error: ${err.name}| ${err.message}`);

  server.close(() => {
    console.log("Shutting down server ..........");
    process.exit(1);
  });
});
