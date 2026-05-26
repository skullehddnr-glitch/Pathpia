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

function normalizeSummary(value) {
  return stripTags(value)
    .replace(/^:\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseClassSpells(html, classId) {
  const results = [];

  const tokenRegex =
    /(\d+)(?:st|nd|rd|th)?-Level[\s\S]{0,120}?Spells|0-Level[\s\S]{0,120}?Spells|<a[^>]+href="(SpellDisplay\.aspx\?ItemName=[^"]+)"[^>]*>([\s\S]*?)<\/a>([\s\S]*?)(?=<br|<\/p|<a|<\/li|<\/td)/gi;

  let currentLevel = null;
  let match;

  while ((match = tokenRegex.exec(html))) {
    const whole = match[0];

    if (/0-Level/i.test(whole)) {
      currentLevel = 0;
      continue;
    }

    const levelMatch = whole.match(/(\d+)(?:st|nd|rd|th)?-Level/i);
    if (levelMatch) {
      currentLevel = Number(levelMatch[1]);
      continue;
    }

    const href = match[2];
    const rawName = match[3];
    const rawSummary = match[4];

    if (currentLevel === null || !href || !rawName) continue;

    const name = stripTags(rawName);
    if (!name) continue;

    const url = "https://www.aonprd.com/" + href.replace(/&amp;/g, "&");
    const summary = normalizeSummary(rawSummary);

    results.push({
      id: toId(name),
      name,
      summary: summary || "SRD에서 가져온 주문입니다.",
      source: "Archives of Nethys",
      url,
      classId,
      spellLevel: currentLevel,
    });
  }

  return results;
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

const code = `import type { SpellEntry } from "./spells";

export const GENERATED_SPELLS: SpellEntry[] = [
${generated
  .map((spell) => {
    const levelEntries = Object.entries(spell.levels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([classId, level]) => `      ${js(classId)}: ${level}`)
      .join(",\n");

    return `  {
    id: ${js(spell.id)},
    name: ${js(spell.name)},
    summary: ${js(spell.summary)},
    school: ${js(spell.school || "")},
    source: ${js(spell.source || "")},
    url: ${js(spell.url || "")},
    levels: {
${levelEntries}
    },
  }`;
  })
  .join(",\n")}
];
`;

fs.mkdirSync(path.resolve("src/data"), { recursive: true });
fs.writeFileSync("src/data/spells.generated.ts", code);

console.log("Generated " + generated.length + " spells -> src/data/spells.generated.ts");
