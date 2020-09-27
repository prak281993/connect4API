const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userId: {
    type: String,
  },
  move: {
    type: Number,
  },
  gameMatrix: {
    type: Array,
  },
});

module.exports = mongoose.model("User", UserSchema);
