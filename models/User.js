const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
  },
  githubId: {
    type: String,
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  image: {
    type: String,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  visiblity :{
    type: String,
    default:"private"
  },
  role: {
    type: String,
    default: "user",
  },
    password: {
        type: String,
    },
  bio: {
    type: String,
    default:"A user from the platform"
  },

});

module.exports = mongoose.model("User", UserSchema);
