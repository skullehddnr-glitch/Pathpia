import fs from "node:fs";
import path from "node:path";

const inputPath = path.resolve("imports/feats.csv");
const outputPath = path.resolve("src/data/feats.generated.ts");

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      field = "";

      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    field += char;
  }

  row.push(field);

  if (row.some((cell) => cell.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

function normalizeHeader(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function getValue(row, headers, names) {
  for (const name of names) {
    const index = headers.indexOf(name);
    if (index >= 0) return (row[index] || "").trim();
  }
  return "";
}

function toId(name) {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .trim();

  let id = cleaned
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index === 0) return lower;
      return lower[0].toUpperCase() + lower.slice(1);
    })
    .join("");

  if (!id) id = "unnamedFeat";
  if (/^[0-9]/.test(id)) id = "feat" + id;

  return id;
}

function js(value) {
  return JSON.stringify(value ?? "");
}

if (!fs.existsSync(inputPath)) {
  console.error("Missing imports/feats.csv");
  console.error("Create it from imports/feats.example.csv, then run pnpm import:feats");
  process.exit(1);
}

const csv = fs.readFileSync(inputPath, "utf8");
const rows = parseCSV(csv);

if (rows.length < 2) {
  console.error("CSV has no data rows.");
  process.exit(1);
}

const headers = rows[0].map(normalizeHeader);
const feats = [];

for (const row of rows.slice(1)) {
  const name = getValue(row, headers, ["name", "feat", "feat_name"]);
  if (!name) continue;

  const type = getValue(row, headers, ["type", "feat_type", "category"]) || "General";
  const prereq = getValue(row, headers, ["prereq", "prerequisite", "prerequisites"]) || "—";
  const benefit = getValue(row, headers, ["benefit", "description", "text", "summary"]);
  const source = getValue(row, headers, ["source", "book"]);
  const url = getValue(row, headers, ["url", "link"]);

  feats.push({
    id: toId(name),
    name,
    type,
    prereq,
    benefit,
    source,
    url,
  });
}

const code = `import type { Feat } from "../types";

export const GENERATED_FEATS: Feat[] = [
${feats
  .map((feat) => {
    return `  {
    id: ${js(feat.id)},
    name: ${js(feat.name)},
    type: ${js(feat.type)},
    prereq: ${js(feat.prereq)},
    benefit: ${js(feat.benefit)},
    source: ${js(feat.source)},
    url: ${js(feat.url)},
  }`;
  })
  .join(",\n")}
];
`;

fs.writeFileSync(outputPath, code);
console.log(`Generated ${feats.length} feats -> ${outputPath}`);
