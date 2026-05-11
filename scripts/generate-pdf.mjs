import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/generate-pdf.mjs <input.md> <output.pdf>');
  process.exit(1);
}

const source = fs.readFileSync(inputPath, 'utf8');
const title = 'Johnny & Jugnu Project Documentation';
const pageWidth = 595.28;
const pageHeight = 841.89;
const margin = 54;
const lineHeight = 14;
const fontSize = 10;
const charsPerLine = 86;
const linesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight) - 2;

function normalizeLine(line) {
  return line
    .replace(/^#{1,6}\s+/, '')
    .replace(/^[-*]\s+/, '- ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-');
}

function wrapLine(line) {
  if (!line.trim()) return [''];
  if (line.length <= charsPerLine) return [line];

  const wrapped = [];
  let current = '';
  for (const word of line.split(/\s+/)) {
    if (!current) {
      current = word;
    } else if ((current + ' ' + word).length <= charsPerLine) {
      current += ' ' + word;
    } else {
      wrapped.push(current);
      current = word;
    }
  }
  if (current) wrapped.push(current);
  return wrapped;
}

const textLines = [];
let inFence = false;

for (const rawLine of source.split(/\r?\n/)) {
  if (rawLine.startsWith('```')) {
    inFence = !inFence;
    textLines.push('');
    continue;
  }

  const normalized = inFence ? rawLine : normalizeLine(rawLine);
  textLines.push(...wrapLine(normalized));
}

const pages = [];
for (let index = 0; index < textLines.length; index += linesPerPage) {
  pages.push(textLines.slice(index, index + linesPerPage));
}

function escapePdfText(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

const objects = [];
const addObject = (body) => {
  objects.push(body);
  return objects.length;
};

const catalogId = addObject('<< /Type /Catalog /Pages 2 0 R >>');
const pagesId = addObject('');
const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
const pageIds = [];

pages.forEach((lines, pageIndex) => {
  const content = [
    'BT',
    `/F1 ${fontSize} Tf`,
    `${margin} ${pageHeight - margin} Td`,
    `(${escapePdfText(title)}) Tj`,
    `0 -${lineHeight * 2} Td`
  ];

  lines.forEach((line) => {
    content.push(`(${escapePdfText(line)}) Tj`);
    content.push(`0 -${lineHeight} Td`);
  });

  content.push(`0 -${lineHeight} Td`);
  content.push(`(Page ${pageIndex + 1} of ${pages.length}) Tj`);
  content.push('ET');

  const stream = content.join('\n');
  const contentId = addObject(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
  const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
  pageIds.push(pageId);
});

objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

let pdf = '%PDF-1.4\n';
const offsets = [0];

objects.forEach((body, index) => {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
});

const xrefOffset = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += '0000000000 65535 f \n';
for (let index = 1; index < offsets.length; index += 1) {
  pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, pdf);
console.log(`Created ${outputPath}`);
