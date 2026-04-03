import { Typography, Box, Button, Paper, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useEffect, useState, useRef } from "react";
import { getQuestionById, getQuestionCountByLevel } from "../services/question";
import { updateLevel } from "../services/level";
import { executeSolution } from "../services/database";
import { saveProgress } from "../services/save";
import type { QueryResult } from "../services/database";
import DataBaseButton from "../components/DataBaseButton";

// Clé de stockage du sessionId dans le localStorage
const SESSION_KEY = "mongolingo_session_id";

/**
 * Récupère ou génère un ID de session unique
 * L'ID est persisté dans le localStorage pour maintenir la session entre les rechargements
 * @returns ID de session
 */
const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId =
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

type QuestionType = {
  _id: string;
  levelId: number;
  questionId: number;
  description: string;
  solution: string;
  explanation: string;
};

function Level() {
  // Récupération des paramètres d'URL (levelId et questionId)
  const { levelId, questionId } = useParams();
  const navigate = useNavigate();
  // Référence vers l'éditeur Monaco
  const editorRef = useRef<any>(null);

  const [question, setQuestion] = useState<QuestionType | null>(null); // Question actuelle
  const [submitted, setSubmitted] = useState(false); // Si la réponse a été soumise
  const [isCompleted, setIsCompleted] = useState(false); // Si le niveau est terminé
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null); // Si la réponse est correcte
  const [solution, setSolution] = useState<string | null>(null); // Affichage de la solution
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null); // Résultat MongoDB
  const [alreadyCompleted, setAlreadyCompleted] = useState(false); // Question déjà complétée

  // Récupération de l'ID de session
  const sessionId = getSessionId();

  /**
   * Charge la question et gère le skip des questions déjà complétées
   */
  useEffect(() => {
    const fetchQuestion = async () => {
      if (!levelId || !questionId) return;

      // Reset des états
      setSubmitted(false);
      setIsCorrect(null);
      setSolution(null);
      setQueryResult(null);
      setAlreadyCompleted(false);

      // Vérifie si cette question a déjà été complétée
      const savedProgress = localStorage.getItem(
        `mongolingo_${levelId}_${questionId}`,
      );
      if (savedProgress) {
        setAlreadyCompleted(true);
        const countData = await getQuestionCountByLevel(Number(levelId));
        const totalQuestions = countData.count;
        const currentQuestion = Number(questionId);

        // Si ce n'est pas la dernière question, cherche la prochaine non-complétée
        if (currentQuestion < totalQuestions) {
          for (let next = currentQuestion + 1; next <= totalQuestions; next++) {
            if (!localStorage.getItem(`mongolingo_${levelId}_${next}`)) {
              navigate(`/level/${levelId}/${next}`);
              return;
            }
          }
        }
        return;
      }

      // Charge la question depuis l'API
      const data = await getQuestionById(Number(levelId), Number(questionId));
      if (data.success) {
        setQuestion(data.question);
      }
    };
    fetchQuestion();
  }, [levelId, questionId, navigate]);

  /**
   * Gère la soumission de la réponse
   * Valide la réponse et sauvegarde la progression si correcte
   */
  const handleSubmit = async () => {
    setSolution(null);
    setQueryResult(null);
    if (editorRef.current && question && question.solution) {
      const code = editorRef.current.getValue();

      // Normalise les espaces pour la comparaison
      const normalizedUserAnswer = code.replace(/\s/g, "");
      const normalizedSolution = question.solution.replace(/\s/g, "");

      // Compare la réponse utilisateur avec la solution attendue
      const correct = normalizedUserAnswer === normalizedSolution;
      setIsCorrect(correct);

      // Si correct, exécute la solution et sauvegarde
      if (correct) {
        const result = await executeSolution(code);
        setQueryResult(result);

        // Sauvegarde la progression
        await saveProgress({
          sessionId,
          levelId: Number(levelId),
          questionId: Number(questionId),
          isCorrect: true,
          userQuery: code,
        });

        // Sauvegarde locale pour l'interface
        localStorage.setItem(`mongolingo_${levelId}_${questionId}`, "true");
      }
    }
    setSubmitted(true);
  };

  /**
   * Gère le passage à la question suivante ou la fin du niveau
   */
  const handleNext = async () => {
    if (!levelId) return;

    const countData = await getQuestionCountByLevel(Number(levelId));
    const totalQuestions = countData.count;
    const currentQuestion = Number(questionId);

    // Si c'est la dernière question du niveau
    if (currentQuestion >= totalQuestions) {
      setIsCompleted(true);
      localStorage.setItem(`mongolingo_level_${levelId}_completed`, "true");
      const nextLevelId = Number(levelId) + 1;
      await updateLevel(nextLevelId);
      // Redirection vers l'accueil après 3 secondes
      setTimeout(() => navigate("/"), 3000);
    } else {
      // Passe à la question suivante
      navigate(`/level/${levelId}/${currentQuestion + 1}`);
    }
  };

  /**
   * Affiche la solution de la question
   */
  const handleSolution = () => {
    if (question) {
      setSolution(question.solution);
    }
  };

  return (
    <Box>
      {/* Bouton d'accès à la page Base de Données */}
      <DataBaseButton />

      {/* Message de félicitations quand le niveau est terminé */}
      {isCompleted && (
        <Alert
          severity="success"
          sx={{
            backgroundColor: "#46a302",
            color: "#ffffff",
            marginBottom: 3,
            borderRadius: 2,
          }}
        >
          <Typography fontWeight={600}>Félicitations !</Typography>
          <Typography>Niveau terminé. Redirection...</Typography>
        </Alert>
      )}

      {/* Numéro de niveau et question */}
      <Typography variant="h1" align="center" sx={{ marginBottom: 4 }}>
        Niveau {levelId} - Question {questionId}
        {/* Indicateur si la question est déjà complétée */}
        {alreadyCompleted && (
          <Typography component="span" sx={{ ml: 2, color: "#46a302" }}>
            ✓ Complétée
          </Typography>
        )}
      </Typography>

      {/* Description de la question */}
      <Typography
        align="center"
        sx={{ marginBottom: 4, fontSize: 18, color: "#ffffff" }}
      >
        {question?.description}
      </Typography>

      {/* Éditeur de code Monaco */}
      <Box
        sx={{
          maxWidth: 600,
          margin: "0 auto",
          marginBottom: 3,
        }}
      >
        <Editor
          height="300px"
          language="javascript"
          theme="vs-dark"
          defaultValue="// Écris ton code ici"
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />

        {/* Bouton de soumission */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Soumettre
          </Button>
        </Box>
      </Box>

      {/* Zone de résultat après soumission */}
      {submitted && (
        <Paper
          sx={{
            maxWidth: 600,
            margin: "0 auto",
            padding: 3,
            backgroundColor: isCorrect ? "#46a302" : "#d32f2f",
            color: "#ffffff",
          }}
        >
          {/* Message de résultat */}
          <Typography variant="h6" fontWeight={600} sx={{ marginBottom: 2 }}>
            {isCorrect ? "✅ Bonne réponse !" : "❌ Mauvaise réponse"}
          </Typography>

          {/* Explication de la réponse */}
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ marginBottom: 2, marginTop: 3 }}
          >
            Explication
          </Typography>
          <Typography sx={{ marginBottom: 3 }}>
            {question?.explanation}
          </Typography>

          {/* Affichage du résultat MongoDB si correct */}
          {isCorrect && queryResult && (
            <Box paddingBottom={2}>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ marginBottom: 2 }}
              >
                Résultat MongoDB
              </Typography>
              <Paper
                sx={{
                  padding: 2,
                  backgroundColor: "#1e1e1e",
                  color: "#00e676",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                {JSON.stringify(queryResult.results, null, 2)}
              </Paper>
            </Box>
          )}

          {/* Affichage de la solution (si incorrect) */}
          {solution && (
            <Box paddingBottom={2}>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ marginBottom: 2 }}
              >
                Solution
              </Typography>
              <Paper
                sx={{
                  padding: 2,
                  backgroundColor: "#1e1e1e",
                  color: "#00e676",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                }}
              >
                {solution}
              </Paper>
            </Box>
          )}

          {/* Boutons d'action */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            {/* Bouton Solution (si incorrect) */}
            {!isCorrect && (
              <Button
                sx={{ marginRight: 2 }}
                variant="contained"
                onClick={handleSolution}
              >
                Solution
              </Button>
            )}
            {/* Bouton Question suivante */}
            <Button variant="contained" onClick={handleNext}>
              Question suivante
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default Level;
