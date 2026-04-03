const Level = require("../models/level");

const levelController = {
  /**
   * Récupère la liste de tous les niveaux
   * @res {success, levels[]}
   */
  async getAllLevels(req, res) {
    try {
      const levels = await Level.find({});
      res.json({
        success: true,
        levels,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Déverrouille un niveau
   * @req.params {levelId}
   * @res {success, message, modifiedCount}
   */
  async updateLevel(req, res) {
    try {
      const { levelId } = req.params;

      // Met à jour le champ 'unlocked' à true
      const result = await Level.updateOne(
        { id: Number(levelId) },
        { $set: { unlocked: true } },
      );

      // Retourne une erreur 404 si le niveau n'existe pas
      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          error: "Niveau non trouvé",
        });
      }

      res.json({
        success: true,
        message: "Niveau mis à jour",
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = levelController;
