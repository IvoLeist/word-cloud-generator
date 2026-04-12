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
}) {
  return (
    <section className="panel">
      <div className="preview-header">
        <div>
          <h2>Vorschau und Download</h2>
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
          {placements.map((placement) => (
            <div
              key={`${placement.text}-${placement.x}-${placement.y}`}
              className="word"
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
