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
}) {
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
          Neu anordnen
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
        min={2}
        max={8}
        value={colorCount}
        onChange={onColorCountChange}
      />

      <SliderField
        id="font-size"
        label="Schriftgröße"
        min={20}
        max={80}
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
