const asyncHandler = require("express-async-handler");

const ApiError = require("../utlis/apiErrors");

const ApiFeatures = require("../utlis/apiFeatures");

exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObject) {
      filter = req.filterObject;
    }
    const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    const { mongooseQuery, paginationResult } = apiFeatures;

    const documents = await mongooseQuery;
    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.create(req.body);
    if (!document) {
      return next(new ApiError(`failed to create ${Model.name}`, 400));
    }
    res.status(200).json({ data: document });
  });

exports.getOne = (Model, virtualOptions) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let query = Model.findById(id);
    if (virtualOptions) {
      query = query.populate(virtualOptions);
    }

    const document = await query;
    console.log(document.reviews);

    if (!document) {
      return next(new ApiError(`no document found with id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return next(
        new ApiError(`no document found with id ${req.params.id}`, 404)
      );
    }
    await document.save();
    res.status(200).json({ data: document });
  });

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findOneAndDelete({ _id: id });

    if (!document) {
      return next(new ApiError(`No document found with id ${id}`, 404));
    }

    res.status(200).json();
  });
