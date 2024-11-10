// userSchema
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide name"],
      maxlength: [50, "Name can not be more than 50 characters"],
      minlength: [3, "Name can not be less than 3 characters"],
      lowercase: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    phone: String,

    profileImg: String,
    email: {
      type: String,
      required: [true, "Please provide email"],
      unique: true,
      lowercase: true,
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    active: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin", "manager"],
      default: "user",
    },
    wishList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    address: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
        },
        alias: String,
        address: String,
        city: String,

        postalCode: String,
        phone: String,
      },
    ],
  },
  { timestamps: true }
);

const setUrlImage = (doc) => {
  if (doc.profileImg && !doc.profileImg.startsWith(process.env.BASE_URL)) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImg}`;
    doc.profileImg = imageUrl;
  }
};

userSchema.post("init", (doc) => {
  setUrlImage(doc);
});

userSchema.post("save", (doc) => {
  setUrlImage(doc);
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", userSchema);
