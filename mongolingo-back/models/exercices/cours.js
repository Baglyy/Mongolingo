const mongoose = require("mongoose");

const coursSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  titre: { type: String, required: true },
  description: { type: String, required: true },
  professeur: { type: String, required: true },
  heures: { type: Number, required: true },
  niveau_requis: { type: Number, required: true },
  capacite: { type: Number, required: true },
  programme: { type: String, required: true },
  date_debut: { type: Date, required: true },
  date_fin: { type: Date, required: true },
  salle: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Cours", coursSchema);
