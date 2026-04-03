const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  levelId: { type: Number, required: true },
  questionId: { type: Number, required: true },
  description: { type: String, required: true },
  solution: { type: String, required: true },
  explanation: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Question", questionSchema);
