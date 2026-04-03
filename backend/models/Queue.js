const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema({
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Machine",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  turnStartedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("Queue", queueSchema);