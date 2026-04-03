/**
 * Page d'accueil de l'application
 * Affiche la liste des niveaux de jeu avec leur progression
 */

import { useState, useEffect } from "react";
import LevelButton from "../components/LevelButton";
import DataBaseButton from "../components/DataBaseButton";
import { getAllLevels } from "../services/level";
import { getQuestionCountByLevel } from "../services/question";

interface Level {
  id: number;
  unlocked: boolean;
  description: string;
}

function Home() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<number, number>>(
    {},
  );

  // Au chargement du composant, récupère tous les niveaux et leur nombre de questions
  useEffect(() => {
    getAllLevels().then((data) => {
      if (data.success) {
        // Trie les niveaux par ID croissant
        const sortedLevels = data.levels.sort(
          (a: Level, b: Level) => a.id - b.id,
        );
        setLevels(sortedLevels);
        // Récupère le nombre de questions pour chaque niveau
        sortedLevels.forEach(async (level: Level) => {
          const countData = await getQuestionCountByLevel(level.id);
          if (countData.success) {
            setQuestionCounts((prev) => ({
              ...prev,
              [level.id]: countData.count,
            }));
          }
        });
      }
    });
  }, []);

  return (
    <>
      {/* Bouton d'accès à la page Base de Données */}
      <DataBaseButton />

      {/* Map chaque niveau en bouton avec un décalage alternatif (gauche/droite) */}
      {levels.map((level: Level, index: number) => {
        // Décalage alternatif (niveaux pairs à gauche, impairs à droite)
        const offset = index % 2 === 0 ? -80 : 80;
        return (
          <LevelButton
            key={level.id}
            level={level}
            offset={offset}
            totalQuestions={questionCounts[level.id] || 1}
          />
        );
      })}
    </>
  );
}

export default Home;
