import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Container, Stack } from "@mui/material";
import HeaderSummary from "./components/HeaderSummary";
import PreviewPanel from "./components/PreviewPanel";
import SettingsPanel from "./components/SettingsPanel";
import { DEFAULT_BACKGROUND, DEFAULT_TEXT, BASE_COLORS } from "./utils/constants";
import { parseCustomColorList, selectColors } from "./utils/colorPalette";
import { downloadWordCloudImage } from "./utils/exportImage";
import { readUploadedFile } from "./utils/fileUpload";
import { parseInput, placeWords } from "./utils/wordCloud";

function joinWordsForInput(words, splitMode) {
  const separators = {
    lines: "\n",
    comma: ", ",
    semicolon: "; ",
  };

  return words.map((word) => word.text).join(separators[splitMode] || separators.lines);
}

export default function GermanWordCloudGenerator({ colorMode, onToggleColorMode }) {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [canvasWidth, setCanvasWidth] = useState(1200);
  const [canvasHeight, setCanvasHeight] = useState(1200);
  const [fontSize, setFontSize] = useState(44);
  const [gap, setGap] = useState(12);
  const [colorCount, setColorCount] = useState(5);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [seed, setSeed] = useState(7);
  const [splitMode, setSplitMode] = useState("lines");
  const [error, setError] = useState("");
  const [customColorsText, setCustomColorsText] = useState("");
  const [wordColorOverrides, setWordColorOverrides] = useState({});
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);
  const colorFileInputRef = useRef(null);

  const words = useMemo(() => parseInput(inputText, splitMode), [inputText, splitMode]);
  const customColorResult = useMemo(
    () => parseCustomColorList(customColorsText),
    [customColorsText]
  );
  const availablePalette = customColorResult.colors.length
    ? customColorResult.colors
    : BASE_COLORS;
  const maxColorCount = availablePalette.length;

  useEffect(() => {
    if (customColorResult.colors.length > 0) {
      setColorCount(customColorResult.colors.length);
      return;
    }

    setColorCount((current) => Math.max(1, Math.min(current, maxColorCount)));
  }, [customColorResult.colors.length, maxColorCount]);

  const selectedColors = useMemo(
    () => selectColors(availablePalette, colorCount),
    [availablePalette, colorCount]
  );

  const placements = useMemo(() => {
    return placeWords({
      words,
      width: canvasWidth,
      height: canvasHeight,
      fontSize,
      gap,
      colors: selectedColors,
      seed,
    });
  }, [words, canvasWidth, canvasHeight, fontSize, gap, selectedColors, seed]);

  useEffect(() => {
    const validWordIds = new Set(words.map((word) => word.id));
    setWordColorOverrides((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([wordId]) => validWordIds.has(wordId))
      );

      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  }, [words]);

  const displayedPlacements = useMemo(
    () =>
      placements.map((placement) => ({
        ...placement,
        color: wordColorOverrides[placement.id] ?? placement.color,
      })),
    [placements, wordColorOverrides]
  );

  const regenerate = () => setSeed((s) => s + 1);

  const downloadImage = (format) =>
    downloadWordCloudImage({
      canvasWidth,
      canvasHeight,
      background,
      placements: displayedPlacements,
      fontSize,
      format,
    });

  const handleWordColorChange = (wordId, color) => {
    setWordColorOverrides((current) => ({
      ...current,
      [wordId]: color,
    }));
  };

  const handleWordTextChange = (wordId, text) => {
    setInputText((currentInputText) => {
      const currentWords = parseInput(currentInputText, splitMode);
      const nextWords = currentWords.map((word) =>
        word.id === wordId ? { ...word, text } : word
      );

      return joinWordsForInput(nextWords, splitMode);
    });
  };

  const handleCanvasWidthChange = (value) => setCanvasWidth(Number(value) || 1200);

  const handleCanvasHeightChange = (value) => setCanvasHeight(Number(value) || 1200);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const text = await readUploadedFile(file);
      setInputText(text);
    } catch (e) {
      setError(e.message || "Datei konnte nicht gelesen werden.");
    }
  };

  const handleColorUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");

    try {
      const text = await readUploadedFile(file);
      setCustomColorsText((currentText) =>
        currentText.trim() ? `${currentText}\n${text}` : text
      );
    } catch (e) {
      setError(e.message || "Farbliste konnte nicht gelesen werden.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1640, py: { xs: 2, md: 4 } }}>
      <Stack spacing={3.5}>
        <HeaderSummary
          wordCount={words.length}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          colorMode={colorMode}
          onToggleColorMode={onToggleColorMode}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "420px minmax(0, 1fr)" },
            gap: 3.5,
            alignItems: "start",
          }}
        >
          <Box sx={{ position: { xl: "sticky" }, top: { xl: 20 } }}>
            <SettingsPanel
              inputText={inputText}
              onInputTextChange={setInputText}
              fileInputRef={fileInputRef}
              onUpload={handleUpload}
              onRegenerate={regenerate}
              error={error}
              colorCount={colorCount}
              onColorCountChange={setColorCount}
              maxColorCount={maxColorCount}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              gap={gap}
              onGapChange={setGap}
              canvasWidth={canvasWidth}
              onCanvasWidthChange={handleCanvasWidthChange}
              canvasHeight={canvasHeight}
              onCanvasHeightChange={handleCanvasHeightChange}
              background={background}
              onBackgroundChange={setBackground}
              splitMode={splitMode}
              onSplitModeChange={setSplitMode}
              customColorsText={customColorsText}
              onCustomColorsTextChange={setCustomColorsText}
              colorFileInputRef={colorFileInputRef}
              onColorUpload={handleColorUpload}
              customColorCount={customColorResult.colors.length}
              invalidColorEntries={customColorResult.invalidEntries}
            />
          </Box>

          <PreviewPanel
            stageRef={stageRef}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            background={background}
            placements={displayedPlacements}
            availableColors={availablePalette}
            fontSize={fontSize}
            selectedColors={selectedColors}
            wordCount={words.length}
            onDownloadImage={downloadImage}
            onWordColorChange={handleWordColorChange}
            onWordTextChange={handleWordTextChange}
          />
        </Box>
      </Stack>
    </Container>
  );
}
