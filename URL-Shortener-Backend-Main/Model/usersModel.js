const mongoose = require("mongoose");

// saving the data in DB
// defining a schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "please add the user name"],
    unique: [true, "username already taken"],
  },
  email: {
    type: String,
    required: [true, "please add the email address"],
    unique: [true, "email already taken"],
  },
  password: {
    type: String,
    required: [true, "please add password"],
  },
  resetToken: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  url: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Url",
    },
  ],
});

// create a model
module.exports = mongoose.model("User", userSchema, "users");
