import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const spellClassPages = [
  { id: "alchemist", aon: "Alchemist" },
  { id: "antipaladin", aon: "Antipaladin" },
  { id: "arcanist", aon: "Arcanist" },
  { id: "bard", aon: "Bard" },
  { id: "bloodrager", aon: "Bloodrager" },
  { id: "cleric", aon: "Cleric" },
  { id: "druid", aon: "Druid" },
  { id: "hunter", aon: "Hunter" },
  { id: "inquisitor", aon: "Inquisitor" },
  { id: "investigator", aon: "Investigator" },
  { id: "magus", aon: "Magus" },
  { id: "medium", aon: "Medium" },
  { id: "mesmerist", aon: "Mesmerist" },
  { id: "occultist", aon: "Occultist" },
  { id: "oracle", aon: "Oracle" },
  { id: "paladin", aon: "Paladin" },
  { id: "psychic", aon: "Psychic" },
  { id: "ranger", aon: "Ranger" },
  { id: "shaman", aon: "Shaman" },
  { id: "skald", aon: "Skald" },
  { id: "sorcerer", aon: "Sorcerer" },
  { id: "spiritualist", aon: "Spiritualist" },
  { id: "summoner", aon: "Summoner" },
  { id: "summonerUnchained", aon: "Summoner (Unchained)" },
  { id: "warpriest", aon: "Warpriest" },
  { id: "witch", aon: "Witch" },
  { id: "wizard", aon: "Wizard" },
];

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          resolve(download(res.headers.location));
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error("Download failed: " + res.statusCode + " " + url));
          return;
        }

        let data = "";
        res.setEncoding("utf8");

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function stripTags(value) {
  return value
    .replace(/<img[^>]*>/gi, " ")
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
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

  if (!id) id = "unnamedSpell";
  if (/^[0-9]/.test(id)) id = "spell" + id;

  return id;
}

function js(value) {
  return JSON.stringify(value ?? "");
}

function cleanSummary(value) {
  return stripTags(value)
    .replace(/^(?:[FMRSTY]\s*)+:\s*/i, "")
    .replace(/^:\s*/, "")
    .trim();
}

function decodeSpellNameFromHref(href) {
  const match = href.match(/ItemName=([^"&]+)/i);
  if (!match) return "";

  return decodeURIComponent(match[1].replace(/\+/g, " ")).trim();
}

function parseLevelFromText(text) {
  if (/0-Level/i.test(text)) return 0;

  const match = text.match(/([1-9])(?:st|nd|rd|th)-Level/i);
  if (!match) return null;

  return Number(match[1]);
}

function parseClassSpells(html, classId) {
  const events = [];

  const levelRegex =
    /<h[1-6][^>]*>\s*(0-Level|[1-9](?:st|nd|rd|th)-Level)\s*<\/h[1-6]>/gi;
  let levelMatch;

  while ((levelMatch = levelRegex.exec(html))) {
    const level = parseLevelFromText(levelMatch[0]);
    if (level === null) continue;

    events.push({
      type: "level",
      index: levelMatch.index,
      level,
      label: stripTags(levelMatch[0]),
    });
  }

  const spellRegex =
    /<a[^>]+href="(SpellDisplay\.aspx\?ItemName=[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

  let spellMatch;

  while ((spellMatch = spellRegex.exec(html))) {
    const href = spellMatch[1].replace(/&amp;/g, "&");
    const rawInner = spellMatch[2];

    let name = stripTags(rawInner);

    // If image/sup/bold nesting makes the inner text dirty, fall back to ItemName.
    const hrefName = decodeSpellNameFromHref(href);

    if (!name || /^[FMRSTY]$/i.test(name) || name.length > 80) {
      name = hrefName;
    }

    if (!name) continue;

    const after = html.slice(spellRegex.lastIndex, spellRegex.lastIndex + 500);
    const summaryEndCandidates = [
      after.indexOf("<br"),
      after.indexOf("<a "),
      after.indexOf("</p"),
      after.indexOf("</td"),
    ].filter((index) => index >= 0);

    const summaryEnd =
      summaryEndCandidates.length > 0 ? Math.min(...summaryEndCandidates) : 300;

    const summary = cleanSummary(after.slice(0, summaryEnd));

    events.push({
      type: "spell",
      index: spellMatch.index,
      name,
      href,
      summary: summary || "SRD에서 가져온 주문입니다.",
    });
  }

  events.sort((a, b) => a.index - b.index);

  const results = [];
  let currentLevel = null;

  for (const event of events) {
    if (event.type === "level") {
      currentLevel = event.level;
      continue;
    }

    if (event.type === "spell") {
      if (currentLevel === null) continue;

      results.push({
        id: toId(event.name),
        name: event.name,
        summary: event.summary,
        source: "Archives of Nethys",
        url: "https://www.aonprd.com/" + event.href,
        classId,
        spellLevel: currentLevel,
      });
    }
  }

  const deduped = [];
  const seen = new Set();

  for (const spell of results) {
    const key =
      spell.classId + ":" + spell.spellLevel + ":" + spell.name.toLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);
    deduped.push(spell);
  }

  const counts = {};
  for (const spell of deduped) {
    counts[spell.spellLevel] = (counts[spell.spellLevel] || 0) + 1;
  }

  console.log(
    "Parsed " +
      deduped.length +
      " spells for " +
      classId +
      " / levels " +
      Object.entries(counts)
        .map(([level, count]) => level + ":" + count)
        .join(", ")
  );

  return deduped;
}

const merged = new Map();

for (const page of spellClassPages) {
  const url =
    "https://www.aonprd.com/Spells.aspx?Class=" +
    encodeURIComponent(page.aon);

  console.log("Downloading spells:", page.aon);

  const html = await download(url);
  const spells = parseClassSpells(html, page.id);

  for (const spell of spells) {
    const key = spell.name.toLowerCase();
    const existing =
      merged.get(key) || {
        id: spell.id,
        name: spell.name,
        summary: spell.summary,
        school: "",
        source: spell.source,
        url: spell.url,
        levels: {},
      };

    existing.levels[spell.classId] = spell.spellLevel;

    if (!existing.summary && spell.summary) {
      existing.summary = spell.summary;
    }

    merged.set(key, existing);
  }
}

const generated = Array.from(merged.values()).sort((a, b) =>
  a.name.localeCompare(b.name)
);

fs.mkdirSync(path.resolve("src/data"), { recursive: true });

fs.writeFileSync(
  "src/data/spells.generated.json",
  JSON.stringify(generated)
);

const code = `import type { SpellEntry } from "./spells";
import generatedSpellsJson from "./spells.generated.json?raw";

export const GENERATED_SPELLS = JSON.parse(generatedSpellsJson) as SpellEntry[];
`;

fs.writeFileSync("src/data/spells.generated.ts", code);

console.log(
  "Generated " +
    generated.length +
    " spells -> src/data/spells.generated.json and src/data/spells.generated.ts"
);
