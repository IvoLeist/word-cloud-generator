import React, { useMemo, useRef, useState } from "react";
import HeaderSummary from "./components/HeaderSummary";
import PreviewPanel from "./components/PreviewPanel";
import SettingsPanel from "./components/SettingsPanel";
import { DEFAULT_BACKGROUND, DEFAULT_TEXT, BASE_COLORS } from "./utils/constants";
import { downloadWordCloudImage } from "./utils/exportImage";
import { readUploadedFile } from "./utils/fileUpload";
import { parseInput, placeWords, selectColors } from "./utils/wordCloud";

export default function GermanWordCloudGenerator() {
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
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);

  const words = useMemo(() => parseInput(inputText, splitMode), [inputText, splitMode]);

  const selectedColors = useMemo(() => selectColors(BASE_COLORS, colorCount), [colorCount]);

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

  const regenerate = () => setSeed((s) => s + 1);

  const downloadImage = (format) =>
    downloadWordCloudImage({
      canvasWidth,
      canvasHeight,
      background,
      placements,
      fontSize,
      format,
    });

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

  return (
    <div className="app-shell">
      <HeaderSummary
        wordCount={words.length}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
      />

      <div className="layout-grid">
        <SettingsPanel
          inputText={inputText}
          onInputTextChange={setInputText}
          fileInputRef={fileInputRef}
          onUpload={handleUpload}
          onRegenerate={regenerate}
          error={error}
          colorCount={colorCount}
          onColorCountChange={setColorCount}
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
        />

        <PreviewPanel
          stageRef={stageRef}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          background={background}
          placements={placements}
          fontSize={fontSize}
          selectedColors={selectedColors}
          wordCount={words.length}
          onDownloadImage={downloadImage}
        />
      </div>
    </div>
  );
}
