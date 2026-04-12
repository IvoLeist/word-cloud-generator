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
  splitByLineOnly,
  onSplitByLineOnlyChange,
}) {
  return (
    <section className="panel">
      <h2>Einstellungen</h2>

      <label>Wörter / Sätze</label>
      <textarea
        className="text-input"
        value={inputText}
        onChange={(event) => onInputTextChange(event.target.value)}
        placeholder="Ein Eintrag pro Zeile"
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
        Browserbasiert unterstützt: .txt und .docx. Klassisches .doc wird abgefangen und mit
        Hinweis gemeldet.
      </small>

      {error && <div className="error-box">{error}</div>}

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

      <label className="checkbox-row" htmlFor="split-lines-only">
        <input
          id="split-lines-only"
          type="checkbox"
          checked={splitByLineOnly}
          onChange={(event) => onSplitByLineOnlyChange(event.target.checked)}
        />
        Nur Zeilen als Trennung (aus: Zeilenumbrüche und Semikolon)
      </label>
    </section>
  );
}
