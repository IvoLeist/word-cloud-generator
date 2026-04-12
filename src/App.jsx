import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useMemo, useState } from "react";
import GermanWordCloudGenerator from "./GermanWordCloudGenerator";

export default function App() {
  const [mode, setMode] = useState("light");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#0b5cab",
          },
          background: {
            default: mode === "light" ? "#f4f8ff" : "#0f172a",
            paper: mode === "light" ? "#ffffff" : "#111827",
          },
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily: '"Avenir Next", "Trebuchet MS", "Segoe UI", sans-serif',
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GermanWordCloudGenerator
        colorMode={mode}
        onToggleColorMode={() =>
          setMode((currentMode) => (currentMode === "light" ? "dark" : "light"))
        }
      />
    </ThemeProvider>
  );
}
