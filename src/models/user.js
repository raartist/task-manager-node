const bcryptjs = require("bcryptjs");
const res = require("express/lib/response");
const jsonwebtoken = require("jsonwebtoken");
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error("How could you be in negative age?");
      }
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowerCase: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid!");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minLength: [7, "Password must be more than 6 characters long!"],
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("Password cannot contain 'password' string!");
      }
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.tokens;

  return userObj;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jsonwebtoken.sign({ _id: user._id.toString() }, "heyyoufellas!", {
    expiresIn: "12 days",
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login!");
  }

  const isMatched = await bcryptjs.compare(password, user.password);

  if (!isMatched) {
    throw new Error("Unable to login!");
  }

  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcryptjs.hash(user.password, 8).then((res) => res);
  }

  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
