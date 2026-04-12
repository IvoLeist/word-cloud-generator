import { useRef, useState } from "react";

export default function PreviewPanel({
  stageRef,
  canvasWidth,
  canvasHeight,
  background,
  placements,
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
    colorInputRef.current?.click();
  };

  const handleColorChange = (event) => {
    if (!activeWord) return;
    onWordColorChange(activeWord.id, event.target.value);
    setActiveWord((current) =>
      current ? { ...current, color: event.target.value } : current
    );
  };

  return (
    <section className="panel">
      <div className="preview-header">
        <div>
          <h2>Vorschau und Download</h2>
          <p>Wort anklicken, um seine Farbe manuell zu ändern.</p>
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
