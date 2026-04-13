function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildWordCloudSvg({
  canvasWidth,
  canvasHeight,
  background,
  placements,
  fontSize,
}) {
  return `
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
}

function loadSvgImage(svg) {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Wortwolke konnte nicht gerendert werden."));
    };

    img.src = url;
  });
}

async function renderWordCloudCanvas({
  canvasWidth,
  canvasHeight,
  background,
  placements,
  fontSize,
}) {
  const svg = buildWordCloudSvg({
    canvasWidth,
    canvasHeight,
    background,
    placements,
    fontSize,
  });
  const img = await loadSvgImage(svg);
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(img, 0, 0);

  return canvas;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function getDosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    Math.floor(date.getSeconds() / 2);
  const dosDate =
    (((year - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f);

  return { dosDate, dosTime };
}

function makeCrcTable() {
  const table = new Uint32Array(256);

  for (let i = 0; i < 256; i += 1) {
    let crc = i;

    for (let j = 0; j < 8; j += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }

    table[i] = crc >>> 0;
  }

  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(data) {
  let crc = 0xffffffff;

  for (let i = 0; i < data.length; i += 1) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(view, offset, value) {
  view.setUint16(offset, value, true);
}

function writeUint32(view, offset, value) {
  view.setUint32(offset, value, true);
}

function createZip(files) {
  const encoder = new TextEncoder();
  const now = getDosDateTime();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  let centralDirectorySize = 0;

  files.forEach(({ name, data }) => {
    const fileName = encoder.encode(name);
    const fileData = data instanceof Uint8Array ? data : encoder.encode(data);
    const crc = crc32(fileData);

    const localHeader = new Uint8Array(30 + fileName.length);
    const localView = new DataView(localHeader.buffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, now.dosTime);
    writeUint16(localView, 12, now.dosDate);
    writeUint32(localView, 14, crc);
    writeUint32(localView, 18, fileData.length);
    writeUint32(localView, 22, fileData.length);
    writeUint16(localView, 26, fileName.length);
    writeUint16(localView, 28, 0);
    localHeader.set(fileName, 30);

    localParts.push(localHeader, fileData);

    const centralHeader = new Uint8Array(46 + fileName.length);
    const centralView = new DataView(centralHeader.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, now.dosTime);
    writeUint16(centralView, 14, now.dosDate);
    writeUint32(centralView, 16, crc);
    writeUint32(centralView, 20, fileData.length);
    writeUint32(centralView, 24, fileData.length);
    writeUint16(centralView, 28, fileName.length);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, offset);
    centralHeader.set(fileName, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + fileData.length;
    centralDirectorySize += centralHeader.length;
  });

  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralDirectorySize);
  writeUint32(endView, 16, offset);
  writeUint16(endView, 20, 0);

  return new Blob([...localParts, ...centralParts, endRecord], {
    type: "application/zip",
  });
}

function pxToPt(px) {
  return (px * 72) / 96;
}

function ptToTwips(pt) {
  return Math.round(pt * 20);
}

function normalizeColor(color) {
  return color.replace(/^#/, "").toUpperCase();
}

function formatPt(value) {
  return Number(value.toFixed(2));
}

function buildRectanglePath(width, height) {
  return `m0,0l0,${height},${width},${height},${width},0xe`;
}

function buildDocxXml({
  canvasWidth,
  canvasHeight,
  background,
  placements,
  fontSize,
}) {
  const marginPt = 18;
  const maxPagePt = 1584;
  const cloudWidthPt = pxToPt(canvasWidth);
  const cloudHeightPt = pxToPt(canvasHeight);
  const scale = Math.min(
    1,
    (maxPagePt - marginPt * 2) / cloudWidthPt,
    (maxPagePt - marginPt * 2) / cloudHeightPt
  );
  const groupWidthPt = cloudWidthPt * scale;
  const groupHeightPt = cloudHeightPt * scale;
  const pageWidthTwips = ptToTwips(groupWidthPt + marginPt * 2);
  const pageHeightTwips = ptToTwips(groupHeightPt + marginPt * 2);
  const marginTwips = ptToTwips(marginPt);
  const fontHalfPoints = Math.max(2, Math.round(pxToPt(fontSize * scale) * 2));
  const groupStyle = `position:relative;left:0;top:0;width:${formatPt(groupWidthPt)}pt;height:${formatPt(groupHeightPt)}pt`;

  const backgroundShape = `
            <v:shape
              id="wordcloud-background"
              style="position:relative;left:0;top:0;width:${formatPt(groupWidthPt)}pt;height:${formatPt(groupHeightPt)}pt;z-index:0"
              coordorigin="0 0"
              coordsize="${canvasWidth} ${canvasHeight}"
              path="${buildRectanglePath(canvasWidth, canvasHeight)}"
              filled="t"
              fillcolor="#${normalizeColor(background)}"
              stroked="f"
            />`;

  const wordShapes = placements
    .map((placement, index) => {
      const leftPt = formatPt(pxToPt(placement.x * scale));
      const topPt = formatPt(pxToPt(placement.y * scale));
      const widthPt = formatPt(pxToPt(placement.w * scale));
      const heightPt = formatPt(pxToPt(Math.max(placement.h, fontSize * 1.35) * scale));

      return `
            <v:shape
              id="word-${placement.id}"
              style="position:relative;left:${leftPt}pt;top:${topPt}pt;width:${widthPt}pt;height:${heightPt}pt;z-index:${index + 1}"
              coordorigin="0 0"
              coordsize="${Math.max(1, Math.round(placement.w))} ${Math.max(1, Math.round(placement.h))}"
              path="${buildRectanglePath(
                Math.max(1, Math.round(placement.w)),
                Math.max(1, Math.round(placement.h))
              )}"
              filled="f"
              stroked="f"
            >
              <v:textbox inset="0,0,0,0" style="mso-fit-shape-to-text:t">
                <w:txbxContent>
                  <w:p>
                    <w:pPr>
                      <w:spacing w:before="0" w:after="0" />
                    </w:pPr>
                    <w:r>
                      <w:rPr>
                        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial" />
                        <w:color w:val="${normalizeColor(placement.color)}" />
                        <w:sz w:val="${fontHalfPoints}" />
                        <w:szCs w:val="${fontHalfPoints}" />
                        <w:noProof />
                      </w:rPr>
                      <w:t xml:space="preserve">${escapeXml(placement.text)}</w:t>
                    </w:r>
                  </w:p>
                </w:txbxContent>
              </v:textbox>
              <w10:wrap type="none" />
            </v:shape>`;
    })
    .join("");

  return {
    contentTypes: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
    rels: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
    document: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w10="urn:schemas-microsoft-com:office:word">
  <w:body>
    <w:p>
      <w:pPr>
        <w:spacing w:before="0" w:after="0" />
      </w:pPr>
      <w:r>
        <w:pict>
          <v:group id="wordcloud-group" style="${groupStyle}" coordorigin="0 0" coordsize="${canvasWidth} ${canvasHeight}">
${backgroundShape}
${wordShapes}
          </v:group>
        </w:pict>
      </w:r>
    </w:p>
    <w:sectPr>
      <w:pgSz w:w="${pageWidthTwips}" w:h="${pageHeightTwips}" />
      <w:pgMar
        w:top="${marginTwips}"
        w:right="${marginTwips}"
        w:bottom="${marginTwips}"
        w:left="${marginTwips}"
        w:header="708"
        w:footer="708"
        w:gutter="0"
      />
    </w:sectPr>
  </w:body>
</w:document>`,
  };
}

export function createWordCloudDocxBlob({
  canvasWidth,
  canvasHeight,
  background,
  placements,
  fontSize,
}) {
  const xml = buildDocxXml({
    canvasWidth,
    canvasHeight,
    background,
    placements,
    fontSize,
  });
  const zipBlob = createZip([
    { name: "[Content_Types].xml", data: xml.contentTypes },
    { name: "_rels/.rels", data: xml.rels },
    { name: "word/document.xml", data: xml.document },
  ]);

  return new Blob([zipBlob], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export async function downloadWordCloudImage({
  canvasWidth,
  canvasHeight,
  background,
  placements,
  fontSize,
  format,
}) {
  const canvas = await renderWordCloudCanvas({
    canvasWidth,
    canvasHeight,
    background,
    placements,
    fontSize,
  });
  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => {
        if (!nextBlob) {
          reject(new Error("Bild konnte nicht exportiert werden."));
          return;
        }
        resolve(nextBlob);
      },
      mime,
      0.95
    );
  });

  downloadBlob(blob, `wortwolke.${format}`);
}

export async function downloadWordCloudDocx({
  canvasWidth,
  canvasHeight,
  background,
  placements,
  fontSize,
}) {
  const blob = createWordCloudDocxBlob({
    canvasWidth,
    canvasHeight,
    background,
    placements,
    fontSize,
  });

  downloadBlob(blob, "wortwolke.docx");
}
