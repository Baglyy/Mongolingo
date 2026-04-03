import { Button } from "@mui/material";
import { Download } from "@mui/icons-material";
import { importData } from "../services/database";

interface ImportButtonProps {
  modelName: string;
  onImportSuccess?: () => void; // Callback appelé après un import réussi
  variant?: "contained" | "outlined"; // Style du bouton
}

/**
 * Composant ImportButton
 * Bouton qui ouvre un sélecteur de fichier pour importer des données
 */
const ImportButton = ({
  modelName,
  onImportSuccess,
  variant = "outlined",
}: ImportButtonProps) => {
  /**
   * Gère la sélection et l'import du fichier
   * @param e - Événement de changement d'input file
   */
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    // Détecte le format BSON par l'extension du fichier
    const isBson = file.name.endsWith(".bson");

    reader.onload = async (event) => {
      try {
        const content = event.target?.result;
        let dataToImport;

        if (isBson) {
          // Conversion en Uint8Array pour le format BSON
          dataToImport = new Uint8Array(content as ArrayBuffer);
        } else {
          // Parsing JSON pour le format texte
          dataToImport = JSON.parse(content as string);
        }

        // Envoi des données au backend
        await importData(modelName, dataToImport, isBson);
        alert("Import réussi !");
        if (onImportSuccess) onImportSuccess();
      } catch (error) {
        console.error("Erreur import:", error);
        alert("Erreur lors de l'importation du fichier.");
      }
    };

    // Lecture du fichier selon le format
    if (isBson) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);

    // Reset l'input pour permettre de ré-importer le même fichier
    e.target.value = "";
  };

  return (
    <Button
      component="label"
      size="small"
      variant={variant}
      sx={{
        color: variant === "outlined" ? "#fff" : "inherit",
        borderColor: variant === "outlined" ? "#58a6ff" : "inherit",
        minWidth: 0,
      }}
    >
      <Download fontSize="small" />
      {/* Input file caché, déclenché par le clic sur le Button */}
      <input type="file" hidden accept=".json,.bson" onChange={handleImport} />
    </Button>
  );
};

export default ImportButton;
