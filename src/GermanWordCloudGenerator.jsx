import React, { useMemo, useRef, useState } from "react";
import mammoth from "mammoth";

const DEFAULT_TEXT = `witzig
entspannt
sportlich
zuverlässig
geduldig
interessiert
selbstständig
spontan
kreativ
ich bin sorgfältig
höflich
ich bin gut in Mathe
cool
ich spreche verschiedene Sprachen
ich bin körperlich belastbar
ich habe viele Ideen
mutig
ehrlich
ich habe Ausdauer
hilfsbereit
kommunikativ
ordentlich
musikalisch
pünktlich`;

const BASE_COLORS = [
  "#000000",
  "#1d4ed8",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0f766e",
  "#be123c",
];

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0) || 1;
}

function parseInput(text, splitByLineOnly) {
  if (!text.trim()) return [];
  const items = splitByLineOnly
    ? text
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
    : text
        .split(/\r?\n|;/)
        .map((s) => s.trim())
        .filter(Boolean);

  return items.map((item, index) => ({
    id: `${index}-${item}`,
    text: item,
  }));
}

function estimateTextWidth(text, fontSize) {
  return Math.max(fontSize * 0.55 * text.length, fontSize * 1.4);
}

function intersects(a, b, gap) {
  return !(
    a.x + a.w + gap < b.x ||
    b.x + b.w + gap < a.x ||
    a.y + a.h + gap < b.y ||
    b.y + b.h + gap < a.y
  );
}

function touches(a, b, gap) {
  const expandedA = {
    x: a.x - gap,
    y: a.y - gap,
    w: a.w + gap * 2,
    h: a.h + gap * 2,
  };
  const expandedB = {
    x: b.x - gap,
    y: b.y - gap,
    w: b.w + gap * 2,
    h: b.h + gap * 2,
  };
  return !(
    expandedA.x + expandedA.w < expandedB.x ||
    expandedB.x + expandedB.w < expandedA.x ||
    expandedA.y + expandedA.h < expandedB.y ||
    expandedB.y + expandedB.h < expandedA.y
  );
}

function placeWords({ words, width, height, fontSize, gap, colors, seed }) {
  const rng = mulberry32(seed);
  const centerX = width / 2;
  const centerY = height / 2;
  const placed = [];

  for (const word of words) {
    const w = estimateTextWidth(word.text, fontSize);
    const h = fontSize * 1.1;
    let best = null;

    for (let i = 0; i < 3500; i++) {
      const angle = i * 0.33;
      const radius = 2.5 * Math.sqrt(i);
      const jitterX = (rng() - 0.5) * 10;
      const jitterY = (rng() - 0.5) * 10;
      const x = centerX + Math.cos(angle) * radius * 8 + jitterX - w / 2;
      const y = centerY + Math.sin(angle) * radius * 6 + jitterY - h / 2;

      const rect = { x, y, w, h, text: word.text };

      if (x < 12 || y < 12 || x + w > width - 12 || y + h > height - 12) {
        continue;
      }

      let collision = false;
      const forbidden = new Set();
      for (const p of placed) {
        if (intersects(rect, p, gap)) {
          collision = true;
          break;
        }
        if (touches(rect, p, gap + 6)) {
          forbidden.add(p.color);
        }
      }
      if (collision) continue;

      let color = colors.find((c) => !forbidden.has(c));
      if (!color) color = colors[Math.floor(rng() * colors.length)];

      best = {
        ...rect,
        color,
      };
      break;
    }

    if (!best) {
      const fallbackColor = colors[Math.floor(rng() * colors.length)];
      best = {
        x: 20 + rng() * Math.max(20, width - w - 40),
        y: 20 + rng() * Math.max(20, height - h - 40),
        w,
        h,
        text: word.text,
        color: fallbackColor,
      };
    }

    placed.push(best);
  }

  return placed;
}

async function readUploadedFile(file) {
  const ext = file.name.toLowerCase().split(".").pop();

  if (ext === "txt") {
    return await file.text();
  }

  if (ext === "docx") {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  if (ext === "doc") {
    throw new Error(
      "Das klassische .doc-Format wird in dieser browserbasierten Version nicht zuverlässig unterstützt. Bitte nutze .docx oder .txt."
    );
  }

  throw new Error("Bitte lade eine .docx- oder .txt-Datei hoch.");
}

export default function GermanWordCloudGenerator() {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [canvasWidth, setCanvasWidth] = useState(1200);
  const [canvasHeight, setCanvasHeight] = useState(1200);
  const [fontSize, setFontSize] = useState(44);
  const [gap, setGap] = useState(12);
  const [colorCount, setColorCount] = useState(5);
  const [background, setBackground] = useState("#f3f4f6");
  const [seed, setSeed] = useState(7);
  const [splitByLineOnly, setSplitByLineOnly] = useState(true);
  const [error, setError] = useState("");
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);

  const words = useMemo(
    () => parseInput(inputText, splitByLineOnly),
    [inputText, splitByLineOnly]
  );

  const selectedColors = useMemo(() => {
    return BASE_COLORS.slice(0, Math.max(2, Math.min(colorCount, BASE_COLORS.length)));
  }, [colorCount]);

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

  const downloadImage = async (format) => {
    const node = stageRef.current;
    if (!node) return;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">
        <rect width="100%" height="100%" fill="${background}" />
        ${placements
          .map(
            (p) => `
              <text
                x="${p.x}"
                y="${p.y + fontSize}"
                font-family="Arial, Helvetica, sans-serif"
                font-size="${fontSize}"
                fill="${p.color}"
              >${p.text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")}</text>`
          )
          .join("")}
      </svg>`;

    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const mime = format === "jpg" ? "image/jpeg" : "image/png";
      const dataUrl = canvas.toDataURL(mime, 0.95);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `wortwolke.${format}`;
      a.click();
    };
    img.src = url;
  };

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
      <header className="page-header">
        <div>
          <h1>German Word Cloud Generator</h1>
          <p className="subtitle">
            Gleiche Schriftgröße für alle Wörter, Upload aus .txt/.docx, Export als PNG/JPG.
          </p>
        </div>

        <div className="summary-strip" aria-label="Schnellinfos">
          <div className="summary-card">
            <span className="summary-label">Einträge</span>
            <strong>{words.length}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Format</span>
            <strong>
              {canvasWidth} x {canvasHeight}
            </strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Export</span>
            <strong>PNG / JPG</strong>
          </div>
        </div>
      </header>

      <div className="layout-grid">
        <section className="panel">
          <h2>Einstellungen</h2>

          <label>Wörter / Sätze</label>
          <textarea
            className="text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
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
              onChange={handleUpload}
            />
            <button type="button" className="secondary" onClick={regenerate}>
              Neu anordnen
            </button>
          </div>

          <small>
            Browserbasiert unterstützt: .txt und .docx. Klassisches .doc wird abgefangen und
            mit Hinweis gemeldet.
          </small>

          {error && <div className="error-box">{error}</div>}

          <label htmlFor="color-count">Anzahl Farben: {colorCount}</label>
          <input
            id="color-count"
            type="range"
            min="2"
            max="8"
            step="1"
            value={colorCount}
            onChange={(e) => setColorCount(Number(e.target.value))}
          />

          <label htmlFor="font-size">Schriftgröße: {fontSize}px</label>
          <input
            id="font-size"
            type="range"
            min="20"
            max="80"
            step="1"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />

          <label htmlFor="gap">Abstand zwischen Wörtern: {gap}px</label>
          <input
            id="gap"
            type="range"
            min="0"
            max="40"
            step="1"
            value={gap}
            onChange={(e) => setGap(Number(e.target.value))}
          />

          <div className="size-grid">
            <div>
              <label htmlFor="width">Breite</label>
              <input
                id="width"
                type="number"
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(Number(e.target.value) || 1200)}
              />
            </div>
            <div>
              <label htmlFor="height">Höhe</label>
              <input
                id="height"
                type="number"
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(Number(e.target.value) || 1200)}
              />
            </div>
          </div>

          <label htmlFor="background">Hintergrundfarbe</label>
          <input
            id="background"
            type="color"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          />

          <label className="checkbox-row" htmlFor="split-lines-only">
            <input
              id="split-lines-only"
              type="checkbox"
              checked={splitByLineOnly}
              onChange={(e) => setSplitByLineOnly(e.target.checked)}
            />
            Nur Zeilen als Trennung (aus: Zeilenumbrüche und Semikolon)
          </label>
        </section>

        <section className="panel">
          <div className="preview-header">
            <div>
              <h2>Vorschau</h2>
              <p>Benachbarte Wörter bekommen nach Möglichkeit unterschiedliche Farben.</p>
            </div>
            <div className="row-wrap">
              <button type="button" onClick={() => downloadImage("png")}>
                PNG
              </button>
              <button type="button" className="secondary" onClick={() => downloadImage("jpg")}>
                JPG
              </button>
            </div>
          </div>

          <div className="preview-meta">
            <span className="preview-badge">Live-Vorschau</span>
            <span className="preview-badge">Desktop optimiert</span>
            <span className="preview-badge">{selectedColors.length} Farben aktiv</span>
          </div>

          <div className="preview-scroll">
            <div
              ref={stageRef}
              className="preview-canvas"
              style={{ width: canvasWidth, height: canvasHeight, background }}
            >
              {placements.map((p) => (
                <div
                  key={`${p.text}-${p.x}-${p.y}`}
                  className="word"
                  style={{ left: p.x, top: p.y, fontSize, color: p.color }}
                >
                  {p.text}
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
            <div className="chip">{words.length} Einträge</div>
          </div>
        </section>
      </div>
    </div>
  );
}
