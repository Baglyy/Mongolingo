const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");

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

    // Efface toutes les collections existantes
    await Cours.deleteMany({});
    await Etudiants.deleteMany({});
    await Grades.deleteMany({});
    await Inscriptions.deleteMany({});
    await Level.deleteMany({});
    await Question.deleteMany({});

    // Charge et insère les données depuis les fichiers JSON

    const coursData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "./data/cours.json"), "utf8"),
    );
    await Cours.insertMany(coursData);

    const etudiantsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "./data/etudiants.json"), "utf8"),
    );
    await Etudiants.insertMany(etudiantsData);

    const gradesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "./data/grades.json"), "utf8"),
    );
    await Grades.insertMany(gradesData);

    const inscriptionsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "./data/inscriptions.json"), "utf8"),
    );
    await Inscriptions.insertMany(inscriptionsData);

    const levelsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "./data/levels.json"), "utf8"),
    );
    await Level.insertMany(levelsData);

    const questionsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "./data/questions.json"), "utf8"),
    );
    await Question.insertMany(questionsData);

    console.log("Initialisation terminée");
    process.exit();
  } catch (error) {
    console.error("Erreur :", error);
    process.exit(1);
  }
}

initializeData();
