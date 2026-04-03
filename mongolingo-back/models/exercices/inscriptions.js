const mongoose = require("mongoose");

const inscriptionSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  coursId: { type: String, required: true },
  date_inscription: { type: Date, required: true },
  statut: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Inscriptions", inscriptionSchema);
