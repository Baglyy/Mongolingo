import { ButtonGroup, Button } from "@mui/material";
import { Upload } from "@mui/icons-material";
import { exportData } from "../services/database";

interface ExportButtonProps {
  modelName: string;
  variant?: "contained" | "outlined" | "text"; // Style du bouton
  size?: "small" | "medium" | "large"; // Taille du bouton
}

/**
 * Composant ExportButton
 * Groupe de boutons pour exporter en JSON ou BSON
 */
const ExportButton = ({
  modelName,
  variant = "contained",
  size = "small",
}: ExportButtonProps) => {
  /**
   * Gère l'export des données
   * @param format - Format d'export ('json' ou 'bson')
   */
  const handleExport = async (format: "json" | "bson") => {
    try {
      // Récupère les données depuis l'API
      const data = await exportData(modelName, format);

      // Crée un Blob avec les données
      const blob = new Blob(
        [format === "bson" ? data : JSON.stringify(data, null, 2)],
        {
          type:
            format === "bson" ? "application/octet-stream" : "application/json",
        },
      );

      // Crée un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${modelName}_backup.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Échec de l'exportation");
    }
  };

  return (
    <ButtonGroup size={size} variant={variant} color="primary">
      {/* Bouton export JSON */}
      <Button startIcon={<Upload />} onClick={() => handleExport("json")}>
        JSON
      </Button>
      {/* Bouton export BSON */}
      <Button onClick={() => handleExport("bson")}>BSON</Button>
    </ButtonGroup>
  );
};

export default ExportButton;
