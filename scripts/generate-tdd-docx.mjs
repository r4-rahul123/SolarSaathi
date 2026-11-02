import fs from "node:fs";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

const tddMarkdown = fs.readFileSync("TDD.md", "utf-8");
const lines = tddMarkdown.split("\n");

const paragraphs = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) {
    paragraphs.push(new Paragraph({ text: "" }));
    continue;
  }

  if (trimmed.startsWith("# ")) {
    paragraphs.push(
      new Paragraph({
        text: trimmed.replace("# ", ""),
        heading: HeadingLevel.TITLE,
        spacing: { after: 200 },
      })
    );
  } else if (trimmed.startsWith("## ")) {
    paragraphs.push(
      new Paragraph({
        text: trimmed.replace("## ", ""),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      })
    );
  } else if (trimmed.startsWith("### ")) {
    paragraphs.push(
      new Paragraph({
        text: trimmed.replace("### ", ""),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 80 },
      })
    );
  } else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: trimmed.replace(/^[\*\-]\s+/, "") })],
        bullet: { level: 0 },
        spacing: { after: 60 },
      })
    );
  } else {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: trimmed })],
        spacing: { after: 80 },
      })
    );
  }
}

const doc = new Document({
  sections: [
    {
      properties: {},
      children: paragraphs,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Technical_Design_Document.docx", buffer);
  console.log("Successfully generated Technical_Design_Document.docx");
});
