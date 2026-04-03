import AppBarMUI from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import logo from "../assets/icon.png";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

/**
 * Composant AppBar
 * Barre de navigation en haut de la page avec logo cliquable
 */
function AppBar() {
  const navigate = useNavigate();

  // Navigation vers l'accueil au clic sur le logo
  const handleClick = () => {
    navigate(`/`);
  };

  return (
    <AppBarMUI color="secondary" position="static">
      <Toolbar>
        {/* Zone cliquable contenant le logo et le titre */}
        <Box
          onClick={handleClick}
          sx={{ cursor: "pointer" }}
          display="flex"
          alignItems="center"
        >
          <img src={logo} alt="Logo" style={{ height: 40 }} />
          <Typography variant="h5" padding={1}>
            Mongolingo
          </Typography>
        </Box>
      </Toolbar>
    </AppBarMUI>
  );
}

export default AppBar;
