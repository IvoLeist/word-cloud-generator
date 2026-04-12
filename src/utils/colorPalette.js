const GERMAN_COLOR_ALIASES = {
  schwarz: "black",
  weiss: "white",
  weiß: "white",
  grau: "gray",
  graue: "gray",
  grauer: "gray",
  graues: "gray",
  silber: "silver",
  gold: "gold",
  rot: "red",
  dunkelrot: "darkred",
  blau: "blue",
  dunkelblau: "darkblue",
  hellblau: "lightskyblue",
  grun: "green",
  grün: "green",
  dunkelgrun: "darkgreen",
  dunkelgrün: "darkgreen",
  hellgrun: "lightgreen",
  hellgrün: "lightgreen",
  gelb: "yellow",
  orange: "orange",
  lila: "purple",
  violett: "violet",
  rosa: "pink",
  pink: "pink",
  turkis: "turquoise",
  türkis: "turquoise",
  cyan: "cyan",
  magenta: "magenta",
  braun: "brown",
  beige: "beige",
};

function splitColorList(input) {
  const rgbMatches = [];
  const protectedInput = input.replace(
    /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)/gi,
    (match) => {
      const token = `__RGB_${rgbMatches.length}__`;
      rgbMatches.push(match);
      return token;
    }
  );

  return protectedInput
    .split(/[\r\n;,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) =>
      entry.replace(/__RGB_(\d+)__/g, (_, index) => rgbMatches[Number(index)] ?? "")
    );
}

function normalizeColorToken(token) {
  const trimmed = token.trim();
  if (!trimmed || typeof document === "undefined") return null;

  const aliasKey = trimmed.toLowerCase();
  const candidate = GERMAN_COLOR_ALIASES[aliasKey] ?? trimmed;
  const swatch = document.createElement("span");
  swatch.style.color = "";
  swatch.style.color = candidate;
  if (!swatch.style.color) return null;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#000000";
  context.fillStyle = candidate;
  return context.fillStyle;
}

export function parseCustomColorList(input) {
  const uniqueColors = new Set();
  const invalidEntries = [];

  for (const token of splitColorList(input)) {
    const normalized = normalizeColorToken(token);
    if (!normalized) {
      invalidEntries.push(token);
      continue;
    }

    uniqueColors.add(normalized);
  }

  return {
    colors: [...uniqueColors],
    invalidEntries,
  };
}

export function selectColors(baseColors, colorCount) {
  return baseColors.slice(0, Math.max(1, Math.min(colorCount, baseColors.length)));
}
