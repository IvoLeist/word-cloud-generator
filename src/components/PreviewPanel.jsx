import { useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function PreviewPanel({
  stageRef,
  canvasWidth,
  canvasHeight,
  background,
  placements,
  availableColors,
  fontSize,
  selectedColors,
  onDownloadImage,
  onWordColorChange,
  onWordTextChange,
}) {
  const colorInputRef = useRef(null);
  const [activeWord, setActiveWord] = useState(null);

  const handleWordClick = (placement) => {
    setActiveWord({
      id: placement.id,
      color: placement.color,
      text: placement.text,
    });
  };

  const handleColorChange = (event) => {
    if (!activeWord) return;
    onWordColorChange(activeWord.id, event.target.value);
    setActiveWord((current) =>
      current ? { ...current, color: event.target.value } : current
    );
  };

  const applyPaletteColor = (color) => {
    if (!activeWord) return;
    onWordColorChange(activeWord.id, color);
    setActiveWord((current) => (current ? { ...current, color } : current));
  };

  const handleTextChange = (event) => {
    if (!activeWord) return;
    const nextText = event.target.value;
    setActiveWord((current) => (current ? { ...current, text: nextText } : current));
    onWordTextChange(activeWord.id, nextText);
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "rgba(255,255,255,0.9)",
        boxShadow: "0 18px 50px rgba(31, 41, 55, 0.09)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 }, "&:last-child": { pb: { xs: 2, md: 3 } } }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "flex-start" }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Vorschau und Download
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Klicke auf ein Wort, um Text und Farbe zu bearbeiten.
              </Typography>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button variant="contained" onClick={() => onDownloadImage("png")}>
                PNG
              </Button>
              <Button variant="outlined" onClick={() => onDownloadImage("jpg")}>
                JPG
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              position: "relative",
              overflow: "auto",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              p: 2,
              maxHeight: "calc(100vh - 270px)",
              background:
                "linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px)",
              backgroundSize: "auto, 28px 28px, 28px 28px",
            }}
          >
            <Box
              ref={stageRef}
              sx={{
                position: "relative",
                width: canvasWidth,
                height: canvasHeight,
                mx: "auto",
                borderRadius: 3,
                background,
                boxShadow: "0 24px 45px rgba(15,23,42,0.16)",
              }}
            >
              <input
                ref={colorInputRef}
                type="color"
                value={activeWord?.color ?? "#000000"}
                onChange={handleColorChange}
                tabIndex={-1}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                  width: 0,
                  height: 0,
                }}
              />
              {placements.map((placement) => (
                <Box
                  key={placement.id}
                  component="button"
                  type="button"
                  onClick={() => handleWordClick(placement)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleWordClick(placement);
                    }
                  }}
                  aria-label={`Text und Farbe fuer ${placement.text} aendern`}
                  sx={{
                    position: "absolute",
                    left: placement.x,
                    top: placement.y,
                    p: 0,
                    border: 0,
                    background: "transparent",
                    color: placement.color,
                    fontSize,
                    lineHeight: 1,
                    fontFamily: "Arial, Helvetica, sans-serif",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    borderRadius: 1,
                    transition: "transform 120ms ease, box-shadow 120ms ease",
                    "&:hover, &:focus-visible": {
                      transform: "translateY(-1px)",
                      boxShadow:
                        "0 0 0 3px rgba(255,255,255,0.9), 0 0 0 5px rgba(11,92,171,0.35)",
                      outline: "none",
                    },
                  }}
                >
                  {placement.text}
                </Box>
              ))}
            </Box>
          </Box>

          {activeWord && (
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Aendere Text und Farbe
                  </Typography>

                  <TextField label="Text" value={activeWord.text} onChange={handleTextChange} />

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {availableColors.map((color) => (
                      <Box
                        key={color}
                        component="button"
                        type="button"
                        onClick={() => applyPaletteColor(color)}
                        aria-label={`Farbe ${color} verwenden`}
                        title={color}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "999px",
                          border: "2px solid",
                          borderColor: activeWord.color === color ? "primary.main" : "rgba(15,23,42,0.12)",
                          backgroundColor: color,
                          cursor: "pointer",
                          boxShadow:
                            activeWord.color === color
                              ? "0 0 0 4px rgba(11,92,171,0.18)"
                              : "inset 0 0 0 1px rgba(255,255,255,0.45)",
                        }}
                      />
                    ))}
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Button variant="outlined" onClick={() => colorInputRef.current?.click()}>
                      Eigene Farbe waehlen
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {selectedColors.map((color) => (
              <Chip
                key={color}
                label={color}
                sx={{
                  borderRadius: 999,
                  "& .MuiChip-avatar": { bgcolor: color },
                }}
                avatar={<Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: color }} />}
                variant="outlined"
              />
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
