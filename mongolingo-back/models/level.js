const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  description: { type: String, required: true },
  unlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Level", levelSchema);
