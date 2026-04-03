import { Box, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface LevelButtonProps {
  level: { id: number; unlocked: boolean };
  offset?: number; // Décalage horizontal (px)
  totalQuestions?: number;
}

/**
 * Composant LevelButton
 * Affiche un bouton pour accéder à un niveau de jeu
 * Inclut un indicateur de progression (X/Y questions complétées)
 */
function LevelButton({
  level,
  offset = 0,
  totalQuestions = 10,
}: LevelButtonProps) {
  const navigate = useNavigate();
  const [completedCount, setCompletedCount] = useState(0); // Questions complétées
  const [isLevelCompleted, setIsLevelCompleted] = useState(false); // Niveau terminé

  /**
   * Calcule le nombre de questions complétées pour ce niveau
   * S'exécute à chaque changement de niveau ou de totalQuestions
   */
  useEffect(() => {
    if (totalQuestions <= 0) return;
    let count = 0;
    for (let i = 1; i <= totalQuestions; i++) {
      if (localStorage.getItem(`mongolingo_${level.id}_${i}`)) {
        count++;
      }
    }
    setCompletedCount(count);
    setIsLevelCompleted(count >= totalQuestions);
  }, [level.id, totalQuestions]);

  /**
   * Trouve la première question non complétée du niveau
   * @returns ID de la prochaine question à faire
   */
  const findNextUncompleted = () => {
    if (totalQuestions <= 0) return 1;
    for (let i = 1; i <= totalQuestions; i++) {
      if (!localStorage.getItem(`mongolingo_${level.id}_${i}`)) {
        return i;
      }
    }
    return 1;
  };

  /**
   * Gère le clic sur le bouton
   * Navigate vers la prochaine question non complétée
   */
  const handleClick = () => {
    if (level.unlocked) {
      const nextQuestion = findNextUncompleted();
      navigate(`/level/${level.id}/${nextQuestion}`);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mb: 5,
      }}
    >
      <Box
        sx={{
          transform: `translateX(${offset}px)`,
          position: "relative",
        }}
      >
        {/* Bouton circulaire du niveau */}
        <IconButton
          onClick={handleClick}
          sx={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            // Couleur selon l'état: vert foncé si complété, vert clair si déverrouillé, gris si verrouillé
            backgroundColor: isLevelCompleted
              ? "#46a302"
              : level.unlocked
                ? "#58cc02"
                : "#a36b6b",
            color: "white",
            "&:hover": {
              backgroundColor: isLevelCompleted
                ? "#3d8a02"
                : level.unlocked
                  ? "#46a302"
                  : "#8b5c5c",
            },
          }}
        >
          {/* Affiche "✓" si complété, sinon le numéro du niveau */}
          <Typography variant="h5">
            {isLevelCompleted ? "✓" : level.id}
          </Typography>
        </IconButton>

        {/* Indicateur de progression (affiché si niveau déverrouillé et questions complétées) */}
        {level.unlocked && completedCount > 0 && (
          <Typography
            sx={{
              position: "absolute",
              bottom: -20,
              fontSize: 12,
              color: "#8b949e",
            }}
          >
            {completedCount}/{totalQuestions}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default LevelButton;
