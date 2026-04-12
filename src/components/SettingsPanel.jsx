import { useMemo, useState } from "react";
import { splitColorList } from "../utils/colorPalette";
import SliderField from "./SliderField";

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
  customColorCount,
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

    const nextTokens = [...customColorTokens, ...draftTokens];
    onCustomColorsTextChange(nextTokens.join("\n"));
    setColorDraft("");
  };

  const removeColorToken = (indexToRemove) => {
    onCustomColorsTextChange(
      customColorTokens.filter((_, index) => index !== indexToRemove).join("\n")
    );
  };

  return (
    <section className="panel">
      <h2>Einstellungen</h2>

      <label>Wörter / Sätze</label>
      <textarea
        className="text-input"
        value={inputText}
        onChange={(event) => onInputTextChange(event.target.value)}
        placeholder="Einträge mit der gewählten Trennung eingeben"
      />

      <div className="row-wrap">
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Datei hochladen
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.docx,.doc"
          style={{ display: "none" }}
          onChange={onUpload}
        />
        <button type="button" className="secondary" onClick={onRegenerate}>
          Generiere neu
        </button>
      </div>

      <small>
        Unterstützt: .txt und .docx.
      </small>

      {error && <div className="error-box">{error}</div>}

      <label htmlFor="split-mode">Trennung</label>
      <select
        id="split-mode"
        value={splitMode}
        onChange={(event) => onSplitModeChange(event.target.value)}
      >
        <option value="lines">Zeilen</option>
        <option value="comma">Komma</option>
        <option value="semicolon">Semikolon</option>
      </select>

      <SliderField
        id="color-count"
        label="Anzahl Farben"
        min={1}
        max={maxColorCount}
        value={colorCount}
        onChange={onColorCountChange}
      />

      <details
        className="collapsible-panel"
        open={Boolean(customColorsText.trim()) || invalidColorEntries.length > 0}
      >
        <summary className="collapsible-summary">
          <span>Eigene Farben</span>
        </summary>

        <div className="collapsible-content">
          <label htmlFor="custom-color-draft">Eigene Farben</label>
          <div className="pill-input-shell">
            <div className="pill-list" aria-label="Eigene Farben Liste">
              {customColorTokens.map((token, index) => (
                <span key={`${token}-${index}`} className="pill-chip">
                  <span className="pill-chip-label">{token}</span>
                  <button
                    type="button"
                    className="pill-chip-remove"
                    onClick={() => removeColorToken(index)}
                    aria-label={`${token} entfernen`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="custom-color-draft"
                className="pill-input"
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
              />
            </div>
          </div>

          <div className="row-wrap">
            <button
              type="button"
              className="secondary"
              onClick={() => colorFileInputRef.current?.click()}
            >
              Farben hochladen
            </button>
            <input
              ref={colorFileInputRef}
              type="file"
              accept=".txt,.docx,.doc"
              style={{ display: "none" }}
              onChange={onColorUpload}
            />
          </div>

          <small>
            Unterstützt Farbwerte als englische oder deutsche Namen sowie Hex- und RGB-Codes.
          </small>

          {invalidColorEntries.length > 0 && (
            <div className="error-box">
              Nicht erkannt: {invalidColorEntries.slice(0, 6).join(", ")}
              {invalidColorEntries.length > 6 ? " ..." : ""}
            </div>
          )}
        </div>
      </details>

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

      <div className="size-grid">
        <div>
          <label htmlFor="width">Breite</label>
          <input
            id="width"
            type="number"
            value={canvasWidth}
            onChange={(event) => onCanvasWidthChange(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="height">Höhe</label>
          <input
            id="height"
            type="number"
            value={canvasHeight}
            onChange={(event) => onCanvasHeightChange(event.target.value)}
          />
        </div>
      </div>

      <label htmlFor="background">Hintergrundfarbe</label>
      <input
        id="background"
        type="color"
        value={background}
        onChange={(event) => onBackgroundChange(event.target.value)}
      />
    </section>
  );
}
