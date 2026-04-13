import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import PaletteIcon from "@mui/icons-material/Palette";
import CloseIcon from "@mui/icons-material/Close";
import FontSizeSelector from "./FontSizeSelector";
import SliderField from "./SliderField";
import { splitColorList } from "../utils/colorPalette";

export default function SettingsPanel({
  words,
  wordPlacements,
  onWordTextChange,
  onWordAdd,
  onWordRemove,
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
  const [wordDraft, setWordDraft] = useState("");
  const [editingWordId, setEditingWordId] = useState(null);
  const [editingWordText, setEditingWordText] = useState("");
  const customColorTokens = useMemo(() => splitColorList(customColorsText), [customColorsText]);
  const placementColorById = useMemo(
    () => Object.fromEntries(wordPlacements.map((placement) => [placement.id, placement.color])),
    [wordPlacements]
  );

  useEffect(() => {
    if (!editingWordId) return;

    const editedWord = words.find((word) => word.id === editingWordId);
    if (!editedWord) {
      setEditingWordId(null);
      setEditingWordText("");
    }
  }, [editingWordId, words]);

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

  const startEditingWord = (word) => {
    setEditingWordId(word.id);
    setEditingWordText(word.text);
  };

  const commitWordEdit = () => {
    if (!editingWordId) return;

    const nextText = editingWordText.trim();
    if (!nextText) {
      onWordRemove(editingWordId);
    } else {
      onWordTextChange(editingWordId, nextText);
    }

    setEditingWordId(null);
    setEditingWordText("");
  };

  const cancelWordEdit = () => {
    setEditingWordId(null);
    setEditingWordText("");
  };

  const commitWordDraft = () => {
    const nextText = wordDraft.trim();
    if (!nextText) {
      setWordDraft("");
      return;
    }

    onWordAdd(nextText);
    setWordDraft("");
  };

  return (
    <Stack
      component="section"
      spacing={2.5}
      sx={(theme) => ({
        p: { xs: 2, md: 3 },
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor:
          theme.palette.mode === "light"
            ? "rgba(255,255,255,0.9)"
            : "rgba(17,24,39,0.9)",
        boxShadow:
          theme.palette.mode === "light"
            ? "0 18px 50px rgba(31, 41, 55, 0.09)"
            : "0 18px 50px rgba(2, 6, 23, 0.45)",
      })}
    >
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Einstellungen
      </Typography>

      <Stack spacing={1}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Wörter / Sätze
        </Typography>
        <Box
          sx={(theme) => ({
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            minHeight: 88,
            alignItems: "center",
            backgroundColor: theme.palette.background.default,
          })}
        >
          {words.map((word) => {
            const isEditing = editingWordId === word.id;
            const pillColor = placementColorById[word.id] ?? "text.primary";

            if (isEditing) {
              return (
                <TextField
                  key={word.id}
                  autoFocus
                  size="small"
                  value={editingWordText}
                  onChange={(event) => setEditingWordText(event.target.value)}
                  onBlur={commitWordEdit}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitWordEdit();
                    }

                    if (event.key === "Escape") {
                      event.preventDefault();
                      cancelWordEdit();
                    }
                  }}
                  sx={{ minWidth: 140, flexShrink: 0 }}
                />
              );
            }

            return (
              <Chip
                key={word.id}
                label={word.text}
                onClick={() => startEditingWord(word)}
                onDelete={() => onWordRemove(word.id)}
                deleteIcon={<CloseIcon />}
                sx={{
                  maxWidth: "100%",
                  borderRadius: 999,
                  color: "#ffffff",
                  backgroundColor: pillColor,
                  fontWeight: 700,
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                  "& .MuiChip-deleteIcon": {
                    color: "rgba(255,255,255,0.88)",
                    "&:hover": {
                      color: "#ffffff",
                    },
                  },
                }}
              />
            );
          })}

          <TextField
            variant="standard"
            value={wordDraft}
            onChange={(event) => setWordDraft(event.target.value)}
            onBlur={commitWordDraft}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === "Tab") {
                event.preventDefault();
                commitWordDraft();
              }
            }}
            placeholder={words.length ? "Weiteres Wort oder Satz" : "Wort oder Satz eingeben"}
            InputProps={{ disableUnderline: true }}
            sx={{ flex: 1, minWidth: 180 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Klick auf ein Pill zum Bearbeiten. Mit dem X entfernst du den Eintrag.
        </Typography>
      </Stack>

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
        sx={(theme) => ({
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
          "&:before": { display: "none" },
          overflow: "hidden",
        })}
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
              sx={(theme) => ({
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                minHeight: 56,
                alignItems: "center",
                backgroundColor: theme.palette.background.default,
              })}
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

      <FontSizeSelector
        id="font-size"
        label="Schriftgröße"
        min={8}
        max={96}
        value={fontSize}
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
