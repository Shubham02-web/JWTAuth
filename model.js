const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please enter  name "],
  },
  password: {
    type: String,
    required: [true, "please enter Password"],
  },
  city: {
    type: String,
    required: [true, "city is required"],
  },
  mobile: {
    type: Number,
    required: [true, "Mobile Number is required"],
  },
});

const user = mongoose.model("User", userSchema);
module.exports = user;
