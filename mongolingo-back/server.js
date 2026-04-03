const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const saveRoutes = require("./routes/saveRoutes");

// Charge les variables d'environnement depuis .env
dotenv.config();

connectDB();

// Charge les modèles Mongoose pour les rendre disponibles
require("./models/exercices/cours");
require("./models/exercices/etudiants");
require("./models/exercices/grades");
require("./models/exercices/inscriptions");
require("./models/level");
require("./models/question");

const app = express();

app.use(cors());
app.use(express.json());

// Routes API
app.use("/api/save", saveRoutes);
app.use("/api/database", require("./routes/databaseRoutes"));
app.use("/api/quiz", require("./routes/questionRoutes"));
app.use("/api/levels", require("./routes/levelRoutes"));

// Démarrage du serveur
app.listen(process.env.PORT, async () => {
  console.log(`Serveur lancé sur ${process.env.PORT}`);
});
