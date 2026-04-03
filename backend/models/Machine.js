const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // Machine 1, Machine 2...
  },
  status: {
    type: String,
    enum: ["available", "running", "maintenance"], // ✅ add this
    default: "available"
  },
  currentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
});

module.exports = mongoose.model("Machine", machineSchema);
