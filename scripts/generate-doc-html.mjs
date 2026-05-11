import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/generate-doc-html.mjs <input.md> <output.html>');
  process.exit(1);
}

const markdown = fs.readFileSync(inputPath, 'utf8');

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

const htmlBlocks = [];
let inFence = false;
let fenceLines = [];
let listOpen = false;

function closeList() {
  if (listOpen) {
    htmlBlocks.push('</ul>');
    listOpen = false;
  }
}

for (const line of markdown.split(/\r?\n/)) {
  if (line.startsWith('```')) {
    if (inFence) {
      htmlBlocks.push(`<pre><code>${escapeHtml(fenceLines.join('\n'))}</code></pre>`);
      fenceLines = [];
      inFence = false;
    } else {
      closeList();
      inFence = true;
    }
    continue;
  }

  if (inFence) {
    fenceLines.push(line);
    continue;
  }

  if (!line.trim()) {
    closeList();
    continue;
  }

  const heading = line.match(/^(#{1,6})\s+(.+)$/);
  if (heading) {
    closeList();
    const level = Math.min(heading[1].length, 3);
    htmlBlocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
    continue;
  }

  const listItem = line.match(/^[-*]\s+(.+)$/);
  if (listItem) {
    if (!listOpen) {
      htmlBlocks.push('<ul>');
      listOpen = true;
    }
    htmlBlocks.push(`<li>${inlineMarkdown(listItem[1])}</li>`);
    continue;
  }

  closeList();
  htmlBlocks.push(`<p>${inlineMarkdown(line)}</p>`);
}

closeList();

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Johnny & Jugnu Project Documentation</title>
  <style>
    @page { size: A4; margin: 18mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #1f2937;
      background: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
    }
    h1, h2, h3 {
      color: #111827;
      line-height: 1.2;
      page-break-after: avoid;
    }
    h1 {
      margin: 0 0 18px;
      padding-bottom: 12px;
      border-bottom: 3px solid #e11d48;
      font-size: 26pt;
    }
    h2 {
      margin: 26px 0 10px;
      padding-top: 8px;
      font-size: 17pt;
    }
    h3 {
      margin: 20px 0 8px;
      font-size: 13pt;
    }
    p { margin: 0 0 9px; }
    ul { margin: 0 0 12px 20px; padding: 0; }
    li { margin: 3px 0; }
    code {
      padding: 1px 4px;
      border-radius: 4px;
      background: #f3f4f6;
      color: #be123c;
      font-family: Consolas, "Courier New", monospace;
      font-size: 9.5pt;
    }
    pre {
      margin: 10px 0 14px;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #111827;
      color: #f9fafb;
      white-space: pre-wrap;
      word-break: break-word;
      page-break-inside: avoid;
    }
    pre code {
      padding: 0;
      background: transparent;
      color: inherit;
      font-size: 9pt;
    }
  </style>
</head>
<body>
${htmlBlocks.join('\n')}
</body>
</html>
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html);
console.log(`Created ${outputPath}`);
