function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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

export function parseInput(text, splitByLineOnly) {
  if (!text.trim()) return [];

  const items = splitByLineOnly
    ? text
        .split(/\r?\n/)
        .map((entry) => entry.trim())
        .filter(Boolean)
    : text
        .split(/\r?\n|;/)
        .map((entry) => entry.trim())
        .filter(Boolean);

  return items.map((item, index) => ({
    id: `${index}-${item}`,
    text: item,
  }));
}

export function selectColors(baseColors, colorCount) {
  return baseColors.slice(0, Math.max(2, Math.min(colorCount, baseColors.length)));
}

export function placeWords({ words, width, height, fontSize, gap, colors, seed }) {
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

      for (const placedWord of placed) {
        if (intersects(rect, placedWord, gap)) {
          collision = true;
          break;
        }

        if (touches(rect, placedWord, gap + 6)) {
          forbidden.add(placedWord.color);
        }
      }

      if (collision) continue;

      let color = colors.find((candidate) => !forbidden.has(candidate));
      if (!color) color = colors[Math.floor(rng() * colors.length)];

      best = {
        ...rect,
        color,
      };
      break;
    }

    if (!best) {
      best = {
        x: 20 + rng() * Math.max(20, width - w - 40),
        y: 20 + rng() * Math.max(20, height - h - 40),
        w,
        h,
        text: word.text,
        color: colors[Math.floor(rng() * colors.length)],
      };
    }

    placed.push(best);
  }

  return placed;
}
