const mongoose = require("mongoose");

const gradesSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  coursId: { type: String, required: true },
  note_finale: { type: Number, required: true },
  presence: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Grades", gradesSchema);
