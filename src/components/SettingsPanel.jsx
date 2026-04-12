import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import PaletteIcon from "@mui/icons-material/Palette";
import SliderField from "./SliderField";
import { splitColorList } from "../utils/colorPalette";

export default function SettingsPanel({
  inputText,
  onInputTextChange,
  fileInputRef,
  onUpload,
  onRegenerate,
  error,
  colorCount,
  onColorCountChange,
  maxColorCount,
  fontSize,
  onFontSizeChange,
  gap,
  onGapChange,
  canvasWidth,
  onCanvasWidthChange,
  canvasHeight,
  onCanvasHeightChange,
  background,
  onBackgroundChange,
  splitMode,
  onSplitModeChange,
  customColorsText,
  onCustomColorsTextChange,
  colorFileInputRef,
  onColorUpload,
  invalidColorEntries,
}) {
  const [colorDraft, setColorDraft] = useState("");
  const customColorTokens = useMemo(() => splitColorList(customColorsText), [customColorsText]);

  const commitColorDraft = () => {
    const draftTokens = splitColorList(colorDraft);
    if (!draftTokens.length) {
      setColorDraft("");
      return;
    }

    onCustomColorsTextChange([...customColorTokens, ...draftTokens].join("\n"));
    setColorDraft("");
  };

  const removeColorToken = (indexToRemove) => {
    onCustomColorsTextChange(
      customColorTokens.filter((_, index) => index !== indexToRemove).join("\n")
    );
  };

  return (
    <Stack
      component="section"
      spacing={2.5}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "rgba(255,255,255,0.9)",
        boxShadow: "0 18px 50px rgba(31, 41, 55, 0.09)",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Einstellungen
      </Typography>

      <TextField
        label="Wörter / Sätze"
        multiline
        rows={10}
        value={inputText}
        onChange={(event) => onInputTextChange(event.target.value)}
        placeholder="Wörter oder Sätze hier eingeben, z. B. durch Zeilenumbruch, Komma oder Semikolon getrennt (je nach Einstellung)"
        sx={{
          "& .MuiInputBase-root": {
            alignItems: "flex-start",
          },
          "& .MuiInputBase-inputMultiline": {
            overflowY: "auto !important",
          },
        }}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button
          variant="contained"
          startIcon={<UploadFileIcon />}
          onClick={() => fileInputRef.current?.click()}
        >
          Datei hochladen
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.docx,.doc"
          style={{ display: "none" }}
          onChange={onUpload}
        />
        <Button variant="outlined" startIcon={<AutorenewIcon />} onClick={onRegenerate}>
          Generiere neu
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Unterstuetzt: .txt und .docx.
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <FormControl fullWidth>
        <TextField
          select
          labelId="split-mode-label"
          label="Trennung"
          value={splitMode}
          onChange={(event) => onSplitModeChange(event.target.value)}
        >
          <MenuItem value="lines">Zeilen</MenuItem>
          <MenuItem value="comma">Komma</MenuItem>
          <MenuItem value="semicolon">Semikolon</MenuItem>
        </TextField>
      </FormControl>

      <SliderField
        id="color-count"
        label="Anzahl Farben"
        min={1}
        max={maxColorCount}
        value={colorCount}
        onChange={onColorCountChange}
      />

      <Accordion
        disableGutters
        defaultExpanded={Boolean(customColorsText.trim()) || invalidColorEntries.length > 0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          "&:before": { display: "none" },
          overflow: "hidden",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PaletteIcon color="primary" fontSize="small" />
            <Typography sx={{ fontWeight: 700 }}>Eigene Farben</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Eigene Farben
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                minHeight: 56,
                alignItems: "center",
              }}
            >
              {customColorTokens.map((token, index) => (
                <Chip
                  key={`${token}-${index}`}
                  label={token}
                  onDelete={() => removeColorToken(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
              <TextField
                variant="standard"
                value={colorDraft}
                onChange={(event) => setColorDraft(event.target.value)}
                onBlur={commitColorDraft}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === "," ||
                    event.key === ";" ||
                    event.key === "Tab"
                  ) {
                    event.preventDefault();
                    commitColorDraft();
                  }
                }}
                placeholder={
                  customColorTokens.length
                    ? "Weitere Farbe eingeben"
                    : "z. B. rot, blue, #ff6600, rgb(34, 139, 34)"
                }
                InputProps={{ disableUnderline: true }}
                sx={{ flex: 1, minWidth: 180 }}
              />
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => colorFileInputRef.current?.click()}
              >
                Farben hochladen
              </Button>
              <input
                ref={colorFileInputRef}
                type="file"
                accept=".txt,.docx,.doc"
                style={{ display: "none" }}
                onChange={onColorUpload}
              />
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Trage Farben in Englisch, Deutsch oder als Hex-/RGB-Codes ein.
            </Typography>

            {invalidColorEntries.length > 0 && (
              <Alert severity="warning">
                Nicht erkannt: {invalidColorEntries.slice(0, 6).join(", ")}
                {invalidColorEntries.length > 6 ? " ..." : ""}
              </Alert>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <SliderField
        id="font-size"
        label="Schriftgröße"
        min={8}
        max={96}
        value={fontSize}
        suffix="px"
        onChange={onFontSizeChange}
      />

      <SliderField
        id="gap"
        label="Abstand zwischen Wörtern"
        min={0}
        max={40}
        value={gap}
        suffix="px"
        onChange={onGapChange}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          fullWidth
          label="Breite"
          type="number"
          value={canvasWidth}
          onChange={(event) => onCanvasWidthChange(event.target.value)}
        />
        <TextField
          fullWidth
          label="Höhe"
          type="number"
          value={canvasHeight}
          onChange={(event) => onCanvasHeightChange(event.target.value)}
        />
      </Stack>

      <TextField
        label="Hintergrundfarbe"
        type="color"
        value={background}
        onChange={(event) => onBackgroundChange(event.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ maxWidth: 200 }}
      />
    </Stack>
  );
}
