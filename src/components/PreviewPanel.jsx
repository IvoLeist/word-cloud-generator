import { useRef, useState } from "react";

export default function PreviewPanel({
  stageRef,
  canvasWidth,
  canvasHeight,
  background,
  placements,
  availableColors,
  fontSize,
  selectedColors,
  wordCount,
  onDownloadImage,
  onWordColorChange,
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

  return (
    <section className="panel">
      <div className="preview-header">
        <div>
          <h2>Vorschau und Download</h2>
          <p>Klicke auf ein Wort, um dessen Farbe zu ändern.</p>
        </div>
        <div className="row-wrap">
          <button type="button" onClick={() => onDownloadImage("png")}>
            PNG
          </button>
          <button type="button" className="secondary" onClick={() => onDownloadImage("jpg")}>
            JPG
          </button>
        </div>
      </div>

      <div className="preview-scroll">
        <div
          ref={stageRef}
          className="preview-canvas"
          style={{ width: canvasWidth, height: canvasHeight, background }}
        >
          <input
            ref={colorInputRef}
            className="word-color-input"
            type="color"
            value={activeWord?.color ?? "#000000"}
            onChange={handleColorChange}
            tabIndex={-1}
            aria-hidden="true"
          />
          {placements.map((placement) => (
            <div
              key={placement.id}
              className="word word-button"
              role="button"
              tabIndex={0}
              onClick={() => handleWordClick(placement)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleWordClick(placement);
                }
              }}
              aria-label={`Farbe fuer ${placement.text} aendern`}
              style={{
                left: placement.x,
                top: placement.y,
                fontSize,
                color: placement.color,
              }}
            >
              {placement.text}
            </div>
          ))}
        </div>
      </div>

      {activeWord && (
        <div className="word-editor">
          <div className="word-editor-header">
            <strong>{activeWord.text}</strong>
            <span className="word-editor-label">Farbe wählen</span>
          </div>

          <div className="word-editor-swatches" aria-label="Verfuegbare Farben">
            {availableColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`swatch-button${activeWord.color === color ? " is-active" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => applyPaletteColor(color)}
                aria-label={`Farbe ${color} verwenden`}
                title={color}
              />
            ))}
          </div>

          <div className="row-wrap word-editor-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => colorInputRef.current?.click()}
            >
              Eigene Farbe waehlen
            </button>
          </div>
        </div>
      )}

      <div className="chips-row">
        {selectedColors.map((color) => (
          <div key={color} className="chip">
            <span className="chip-dot" style={{ backgroundColor: color }} />
            {color}
          </div>
        ))}
      </div>
    </section>
  );
}
