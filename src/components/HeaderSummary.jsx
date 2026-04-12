export default function HeaderSummary({ wordCount, canvasWidth, canvasHeight }) {
  return (
    <header className="page-header">
      <div>
        <h1>German Word Cloud Generator</h1>
      </div>

      <div className="summary-strip" aria-label="Schnellinfos">
        <div className="summary-card">
          <span className="summary-label">Wörter oder Sätze</span>
          <strong>{wordCount}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Format</span>
          <strong>
            {canvasWidth} x {canvasHeight}
          </strong>
        </div>
      </div>
    </header>
  );
}
