const API_URL = import.meta.env.VITE_API_URL;

/**
 * Sauvegarde la progression d'une question
 * @param data - Objet contenant sessionId, levelId, questionId, isCorrect, userQuery, attempts
 * @returns Le résultat de la requête
 */
export const saveProgress = async (data: {
  sessionId: string;
  levelId: number;
  questionId: number;
  isCorrect: boolean;
  userQuery: string;
  attempts?: number;
}) => {
  try {
    const res = await fetch(`${API_URL}/save/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  } catch (error) {
    console.error("Erreur saveProgress:", error);
    return { success: false };
  }
};

/**
 * Charge la progression sauvegardée d'une session
 * @param sessionId - Identifiant unique de la session utilisateur
 * @returns La progression et les stats
 */
export const loadProgress = async (sessionId: string) => {
  try {
    const res = await fetch(`${API_URL}/save/progress/${sessionId}`);
    return res.json();
  } catch (error) {
    console.error("Erreur loadProgress:", error);
    return { success: false, progress: [], completedLevels: [] };
  }
};

/**
 * Récupère la liste des niveaux complétés pour une session
 * @param sessionId - Identifiant unique de la session utilisateur
 * @returns Le tableau des niveaux complétés
 */
export const getCompletedLevels = async (sessionId: string) => {
  try {
    const res = await fetch(`${API_URL}/save/completed-levels/${sessionId}`);
    return res.json();
  } catch (error) {
    console.error("Erreur getCompletedLevels:", error);
    return { success: false, completedLevels: [] };
  }
};
