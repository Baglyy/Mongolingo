import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#58cc02",
    },
    secondary: {
      main: "#152d32",
    },
    background: {
      default: "#001f24",
    },
  },

  typography: {
    fontFamily: "Montserrat, sans-serif",
    h1: {
      color: "white",
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 700,
    },
  },
});

export default theme;