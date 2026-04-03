const fs = require("fs");
const path = require("path");

// Dossier des sauvegardes
const SAVE_DIR = path.join(__dirname, "../saves");

// Crée le répertoire de sauvegarde s'il n'existe pas
if (!fs.existsSync(SAVE_DIR)) {
  fs.mkdirSync(SAVE_DIR, { recursive: true });
}

/**
 * Retourne le chemin du fichier de progression pour une session
 * @param sessionId - ID de la session
 * @returns Chemin complet du fichier
 */
const getProgressFile = (sessionId) =>
  path.join(SAVE_DIR, `${sessionId}_progress.json`);

/**
 * Retourne le chemin du fichier des niveaux complétés pour une session
 * @param sessionId - ID de la session
 * @returns Chemin complet du fichier
 */
const getLevelsFile = (sessionId) =>
  path.join(SAVE_DIR, `${sessionId}_levels.json`);

const saveController = {
  /**
   * Sauvegarde la progression d'une question répondu
   * @req.body {sessionId, levelId, questionId, isCorrect, userQuery, attempts}
   * @res {success, message}
   */
  async saveProgress(req, res) {
    try {
      const {
        sessionId,
        levelId,
        questionId,
        isCorrect,
        userQuery,
        attempts,
      } = req.body;

      // Validation des paramètres obligatoires
      if (!sessionId || !questionId) {
        return res.status(400).json({
          success: false,
          error: "sessionId et questionId sont requis",
        });
      }

      const progressFile = getProgressFile(sessionId);

      // Charge la progression existante ou crée un nouveau tableau
      let progress = [];
      if (fs.existsSync(progressFile)) {
        const data = fs.readFileSync(progressFile, "utf8");
        progress = JSON.parse(data);
      }

      // Clé unique pour identifier la question
      const key = `${levelId}-${questionId}`;
      const existingIndex = progress.findIndex((p) => p.key === key);

      if (existingIndex !== -1) {
        // Question déjà répondue, met à jour les données
        if (isCorrect) {
          // Si la nouvelle réponse est correcte, met à jour l'entrée
          progress[existingIndex] = {
            ...progress[existingIndex],
            isCorrect: true,
            userQuery,
            attempts: attempts || progress[existingIndex].attempts,
            completedAt: new Date().toISOString(),
          };
        } else {
          // Incrémente le nombre de tentatives
          progress[existingIndex].attempts =
            (progress[existingIndex].attempts || 1) + 1;
          progress[existingIndex].userQuery = userQuery;
        }
      } else {
        // Nouvelle question, ajoute une entrée
        progress.push({
          key,
          levelId,
          questionId,
          isCorrect,
          userQuery,
          attempts: attempts || 1,
          completedAt: isCorrect ? new Date().toISOString() : null,
        });
      }

      // Sauvegarde dans le fichier
      fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));

      res.json({
        success: true,
        message: "Progression sauvegardée",
      });
    } catch (error) {
      console.error("Erreur saveProgress:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Retourne la liste des niveaux complétés pour une session
   * @req.params {sessionId}
   * @res {success, completedLevels[]}
   */
  async getCompletedLevels(req, res) {
    try {
      const { sessionId } = req.params;
      const levelsFile = getLevelsFile(sessionId);

      // Retourne un tableau vide si aucun fichier n'existe
      if (!fs.existsSync(levelsFile)) {
        return res.json({ success: true, completedLevels: [] });
      }

      const data = fs.readFileSync(levelsFile, "utf8");
      const completedLevels = JSON.parse(data);

      res.json({ success: true, completedLevels });
    } catch (error) {
      console.error("Erreur getCompletedLevels:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Charge la progression complète d'une session
   * @req.params {sessionId}
   * @res {success, stats, progress[], completedLevels[]}
   */
  async loadProgress(req, res) {
    try {
      const { sessionId } = req.params;
      const progressFile = getProgressFile(sessionId);
      const levelsFile = getLevelsFile(sessionId);

      let progress = [];
      let completedLevels = [];

      // Charge les données de progression
      if (fs.existsSync(progressFile)) {
        const data = fs.readFileSync(progressFile, "utf8");
        progress = JSON.parse(data);
      }

      // Charge les niveaux complétés
      if (fs.existsSync(levelsFile)) {
        const data = fs.readFileSync(levelsFile, "utf8");
        completedLevels = JSON.parse(data);
      }

      // Calcule les statistiques
      const stats = {
        totalQuestions: progress.length,
        correctAnswers: progress.filter((p) => p.isCorrect).length,
        incorrectAnswers: progress.filter((p) => !p.isCorrect).length,
        averageAttempts:
          progress.length > 0
            ? (
                progress.reduce((sum, p) => sum + p.attempts, 0) /
                progress.length
              ).toFixed(2)
            : 0,
      };

      res.json({
        success: true,
        stats,
        progress,
        completedLevels,
      });
    } catch (error) {
      console.error("Erreur loadProgress:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = saveController;
