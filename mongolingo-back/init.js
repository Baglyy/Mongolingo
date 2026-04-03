/**
 * Script d'initialisation de la base de données
 * Charge les données initiales depuis les fichiers JSON dans MongoDB
 * ATTENTION: Réinitialise complètement toutes les données (y compris les niveaux déverrouillés)
 */

const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");

// Import des modèles Mongoose
const Cours = require("./models/exercices/cours");
const Etudiants = require("./models/exercices/etudiants");
const Grades = require("./models/exercices/grades");
const Inscriptions = require("./models/exercices/inscriptions");
const Level = require("./models/level");
const Question = require("./models/question");

dotenv.config();

/**
 * Fonction principale d'initialisation
 * Supprime toutes les données existantes et recharge les données depuis les fichiers JSON
 */
async function initializeData() {
  try {
    await connectDB();
    console.log("Initialisation des données...");

    // SUPPRESSION: Efface toutes les collections existantes
    await Cours.deleteMany({});
    await Etudiants.deleteMany({});
    await Grades.deleteMany({});
    await Inscriptions.deleteMany({});
    await Level.deleteMany({});
    await Question.deleteMany({});

    // INSERTION: Charge et insère les données depuis les fichiers JSON

    // Données des cours
    const coursData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "./data/cours.json"), "utf8"),
    );
    await Cours.insertMany(coursData);
    console.log(`${coursData.length} cours insérés`);

    // Données des étudiants
    const etudiantsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "./data/etudiants.json"), "utf8"),
    );
    await Etudiants.insertMany(etudiantsData);
    console.log(`${etudiantsData.length} étudiants insérés`);

    // Données des grades
    const gradesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "./data/grades.json"), "utf8"),
    );
    await Grades.insertMany(gradesData);
    console.log(`${gradesData.length} grades insérés`);

    // Données des inscriptions
    const inscriptionsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "./data/inscriptions.json"), "utf8"),
    );
    await Inscriptions.insertMany(inscriptionsData);
    console.log(`${inscriptionsData.length} inscriptions insérées`);

    // Données des niveaux
    const levelsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "./data/levels.json"), "utf8"),
    );
    await Level.insertMany(levelsData);
    console.log(`${levelsData.length} niveaux insérés`);

    // Données des questions
    const questionsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "./data/questions.json"), "utf8"),
    );
    await Question.insertMany(questionsData);
    console.log(`${questionsData.length} questions insérées`);

    console.log("Initialisation terminée ✅");
    process.exit();
  } catch (error) {
    console.error("Erreur :", error);
    process.exit(1);
  }
}

initializeData();
