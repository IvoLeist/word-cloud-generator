import mammoth from "mammoth";

export async function readUploadedFile(file) {
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
