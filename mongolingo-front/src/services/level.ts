const API_URL = import.meta.env.VITE_API_URL;

/**
 * Récupère la liste de tous les niveaux
 * @returns Le tableau des niveaux
 */
export const getAllLevels = async () => {
  const res = await fetch(`${API_URL}/levels`);
  return res.json();
};

/**
 * Déverrouille un niveau spécifique 
 * @param levelId - ID du niveau à déverrouiller
 * @returns Le résultat de la mise à jour
 */
export const updateLevel = async (levelId: number) => {
  try {
    const res = await fetch(`${API_URL}/levels/${levelId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error("Erreur API");
    return res.json();
  } catch (error) {
    console.error("Erreur updateLevel:", error);
    return { success: false };
  }
};
