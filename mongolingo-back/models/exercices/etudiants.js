const { NumberUtils } = require("bson");
const mongoose = require("mongoose");

const etudiantsSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  date_naissance: { type: Date, required: true },
  genre: { type: String, required: true },
  adresse: { type: String, required: true },
  telephone: { type: String, required: true },
  date_inscription: { type: Date, required: true },
  statut: { type: String, required: true },
  niveau: { type: Number, required: true },
  programme: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Etudiants", etudiantsSchema);
