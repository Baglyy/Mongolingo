const API_URL = import.meta.env.VITE_API_URL;

/**
 * Récupère une question spécifique par son niveau et ID
 * @param levelId - ID du niveau de la question
 * @param questionId - ID de la question
 * @returns Les données de la question
 */
export const getQuestionById = async (levelId: number, questionId: number) => {
  const res = await fetch(`${API_URL}/quiz/question/${levelId}/${questionId}`);
  return res.json();
};

/**
 * Récupère le nombre total de questions pour un niveau donné
 * @param levelId - ID du niveau
 * @returns Le nombre de questions
 */
export const getQuestionCountByLevel = async (levelId: number) => {
  const res = await fetch(`${API_URL}/quiz/count/${levelId}`);
  return res.json();
};
