const Question = require("../models/question");

const quizController = {
  /**
   * Récupère une question spécifique par son niveau et ID
   * @req.params {levelId, questionId}
   * @res {success, question}
   */
  async getQuestionById(req, res) {
    try {
      const { levelId, questionId } = req.params;

      // Recherche la question dans MongoDB
      const question = await Question.findOne({
        levelId: Number(levelId),
        questionId: Number(questionId),
      });

      // Retourne une erreur 404 si la question n'existe pas
      if (!question) {
        return res.status(404).json({
          success: false,
          error: "Question non trouvée",
        });
      }

      // Retourne les données de la question
      res.json({
        success: true,
        question: {
          _id: question._id,
          levelId: question.levelId,
          questionId: question.questionId,
          difficulty: question.difficulty,
          title: question.title,
          description: question.description,
          collection: question._collection,
          expectedOperation: question.expectedOperation,
          hint: question.hint,
          explanation: question.explanation,
          solution: question.solution,
          expectedQuery: question.expectedQuery,
          validationFn: question.validationFn,
          createdAt: question.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Retourne le nombre de questions pour un niveau donné
   * @req.params {levelId}
   * @res {success, count}
   */
  async getQuestionCountByLevel(req, res) {
    try {
      const { levelId } = req.params;
      const questions = await Question.countDocuments({
        levelId: Number(levelId),
      });
      res.json({
        success: true,
        count: questions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = quizController;
