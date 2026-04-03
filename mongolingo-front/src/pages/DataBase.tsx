import { useEffect, useState } from "react";
import { getAllSchemas } from "../services/database";
import {
  Container,
  Button,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import ExportButton from "../components/ExportButton";
import ImportButton from "../components/ImportButton";

function DataBase() {
  // Schémas de toutes les collections
  const [schemas, setSchemas] = useState<any>(null);
  // Collection actuellement sélectionnée pour affichage des données
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null,
  );
  // Données de la collection sélectionnée
  const [collectionData, setCollectionData] = useState<any[]>([]);
  // Indicateur de chargement
  const [loading, setLoading] = useState(false);
  // Message d'erreur éventuel
  const [error, setError] = useState<string | null>(null);

  /**
   * Au chargement du composant, récupère les schémas de toutes les collections
   */
  useEffect(() => {
    const fetchAll = async () => {
      const data = await getAllSchemas();
      setSchemas(data);
    };
    fetchAll();
  }, []);

  /**
   * Charge les données d'une collection lors du clic
   * @param modelName - Nom de la collection à charger
   */
  const handleCollectionClick = async (modelName: string) => {
    setSelectedCollection(modelName);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/database/export?format=json");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const allData = await response.json();
      // Extrait les données de la collection demandée
      const data = allData[modelName] || [];

      setCollectionData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setError(
        `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      );
      setCollectionData([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ferme le dialogue et réinitialise les états
   */
  const handleCloseDialog = () => {
    setSelectedCollection(null);
    setCollectionData([]);
    setError(null);
  };

  /**
   * Retourne les colonnes (clés) des données de la collection
   * Exclut le champ _id et __v
   */
  const getDataColumns = () => {
    if (collectionData.length === 0) return [];
    return Object.keys(collectionData[0]).filter(
      (col) => col !== "_id" && col !== "__v",
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      {/* Titre de la page */}
      <Typography
        variant="h1"
        gutterBottom
        align="center"
        sx={{ mb: 4, fontWeight: "bold" }}
      >
        Collections de la base de données
      </Typography>

      {/* Boutons d'action (export/import de toutes les collections) */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Stack direction="row" spacing={2}>
          <ExportButton modelName="all" />
          <ImportButton
            modelName="all"
            onImportSuccess={() => window.location.reload()}
          />
        </Stack>
      </Box>

      {/* Grille d'affichage des collections avec leur schéma */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 3,
          alignItems: "start",
        }}
      >
        {schemas &&
          Object.entries(schemas).map(([modelName, structure]) => (
            <Card
              key={modelName}
              elevation={0}
              sx={{
                borderRadius: 3,
                bgcolor: "#0d1117",
                border: "1px solid #30363d",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  border: "1px solid #58a6ff",
                  boxShadow: "0 0 10px rgba(88, 166, 255, 0.2)",
                },
              }}
              onClick={() => handleCollectionClick(modelName)}
            >
              {/* En-tête avec le nom de la collection */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#161b22",
                  borderBottom: "1px solid #30363d",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    color: "#58a6ff",
                    fontWeight: "600",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {">"} {modelName}
                </Typography>
              </Box>

              {/* Tableau du schéma de la collection */}
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "#161b22" }}>
                      <TableRow>
                        <TableCell
                          sx={{
                            color: "#8b949e",
                            borderBottom: "1px solid #30363d",
                            fontWeight: "bold",
                          }}
                        >
                          Champ
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#8b949e",
                            borderBottom: "1px solid #30363d",
                            fontWeight: "bold",
                          }}
                        >
                          Type
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(structure as any).map(
                        ([key, val]: [string, any]) => (
                          <TableRow
                            key={key}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell
                              sx={{
                                color: "#ff7b72",
                                fontFamily: "'Fira Code', monospace",
                                borderBottom: "1px solid #21262d",
                              }}
                            >
                              {key}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "#a5d6ff",
                                fontFamily: "'Fira Code', monospace",
                                borderBottom: "1px solid #21262d",
                              }}
                            >
                              {val.type}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ))}
      </Box>

      {/* Dialogue d'affichage des données de la collection */}
      <Dialog
        open={selectedCollection !== null}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#0d1117",
            backgroundImage: "none",
          },
        }}
      >
        {/* Titre du dialogue */}
        <DialogTitle
          sx={{
            bgcolor: "#161b22",
            borderBottom: "1px solid #30363d",
            color: "#58a6ff",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Données de {selectedCollection}
          <Button
            onClick={handleCloseDialog}
            sx={{ color: "#8b949e", minWidth: "auto" }}
          >
            <Close />
          </Button>
        </DialogTitle>

        {/* Contenu du dialogue */}
        <DialogContent
          sx={{
            p: 2,
            maxHeight: "70vh",
            overflow: "auto",
          }}
        >
          {/* Message d'erreur */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Indicateur de chargement */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : collectionData.length === 0 ? (
            <Typography sx={{ color: "#8b949e", textAlign: "center", py: 5 }}>
              Aucune donnée dans cette collection
            </Typography>
          ) : (
            /* Tableau des données */
            <TableContainer
              sx={{
                maxHeight: "600px",
                overflow: "visible",
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead sx={{ bgcolor: "#161b22" }}>
                  <TableRow>
                    {getDataColumns().map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          color: "#8b949e",
                          borderBottom: "1px solid #30363d",
                          fontWeight: "bold",
                          bgcolor: "#161b22",
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {collectionData.map((row, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:hover": { bgcolor: "#161b22" },
                      }}
                    >
                      {getDataColumns().map((col) => (
                        <TableCell
                          key={`${idx}-${col}`}
                          sx={{
                            color: "#c9d1d9",
                            borderBottom: "1px solid #21262d",
                            maxWidth: "250px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={
                            typeof row[col] === "object"
                              ? JSON.stringify(row[col])
                              : String(row[col])
                          }
                        >
                          {typeof row[col] === "object"
                            ? JSON.stringify(row[col])
                            : String(row[col])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        {/* Actions du dialogue */}
        <DialogActions
          sx={{ bgcolor: "#161b22", borderTop: "1px solid #30363d", p: 2 }}
        >
          <Button onClick={handleCloseDialog} variant="outlined">
            Fermer
          </Button>
          <ExportButton modelName={selectedCollection || ""} />
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default DataBase;
