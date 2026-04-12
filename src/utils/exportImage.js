function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function downloadWordCloudImage({
  canvasWidth,
  canvasHeight,
  background,
  placements,
  fontSize,
  format,
}) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">
      <rect width="100%" height="100%" fill="${background}" />
      ${placements
        .map(
          (placement) => `
            <text
              x="${placement.x}"
              y="${placement.y + fontSize}"
              font-family="Arial, Helvetica, sans-serif"
              font-size="${fontSize}"
              fill="${placement.color}"
            >${escapeXml(placement.text)}</text>`
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
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `wortwolke.${format}`;
    link.click();
  };

  img.src = url;
}
