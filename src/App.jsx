import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import GermanWordCloudGenerator from "./GermanWordCloudGenerator";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0b5cab",
    },
    background: {
      default: "#f4f8ff",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Avenir Next", "Trebuchet MS", "Segoe UI", sans-serif',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GermanWordCloudGenerator />
    </ThemeProvider>
  );
}
