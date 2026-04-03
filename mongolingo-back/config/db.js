const mongoose = require("mongoose");

/**
 * Connexion à la base de données MongoDB
 * Utilise l'URI définie dans les variables d'environnement
 */
const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connecté");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
