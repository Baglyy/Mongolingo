import TableChartIcon from "@mui/icons-material/TableChart";
import { useNavigate } from "react-router-dom";
import { Box, Button } from "@mui/material";

/**
 * Composant DataBaseButton
 * Bouton pour accéder à la page de gestion de la base de données
 */
function DataBase() {
  const navigate = useNavigate();

  // Navigation vers la page database
  const handleClick = () => {
    navigate(`/database`);
  };

  return (
    <Box padding={3}>
      <Button
        onClick={handleClick}
        variant="contained"
        sx={{
          color: "white",
          backgroundColor: "secondary.main",
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          fontSize: 20,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <TableChartIcon sx={{ fontSize: 20 }} />
        Collections
      </Button>
    </Box>
  );
}

export default DataBase;
