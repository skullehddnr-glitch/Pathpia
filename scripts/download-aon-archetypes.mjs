import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const classList = [
  { id: "alchemist", name: "Alchemist" },
  { id: "antipaladin", name: "Antipaladin" },
  { id: "arcanist", name: "Arcanist" },
  { id: "barbarian", name: "Barbarian" },
  { id: "bard", name: "Bard" },
  { id: "bloodrager", name: "Bloodrager" },
  { id: "brawler", name: "Brawler" },
  { id: "cavalier", name: "Cavalier" },
  { id: "cleric", name: "Cleric" },
  { id: "druid", name: "Druid" },
  { id: "fighter", name: "Fighter" },
  { id: "gunslinger", name: "Gunslinger" },
  { id: "hunter", name: "Hunter" },
  { id: "inquisitor", name: "Inquisitor" },
  { id: "investigator", name: "Investigator" },
  { id: "kineticist", name: "Kineticist" },
  { id: "magus", name: "Magus" },
  { id: "medium", name: "Medium" },
  { id: "mesmerist", name: "Mesmerist" },
  { id: "monk", name: "Monk" },
  { id: "ninja", name: "Ninja" },
  { id: "occultist", name: "Occultist" },
  { id: "oracle", name: "Oracle" },
  { id: "paladin", name: "Paladin" },
  { id: "psychic", name: "Psychic" },
  { id: "ranger", name: "Ranger" },
  { id: "rogue", name: "Rogue" },
  { id: "samurai", name: "Samurai" },
  { id: "shaman", name: "Shaman" },
  { id: "shifter", name: "Shifter" },
  { id: "skald", name: "Skald" },
  { id: "slayer", name: "Slayer" },
  { id: "sorcerer", name: "Sorcerer" },
  { id: "spiritualist", name: "Spiritualist" },
  { id: "summoner", name: "Summoner" },
  { id: "swashbuckler", name: "Swashbuckler" },
  { id: "vigilante", name: "Vigilante" },
  { id: "warpriest", name: "Warpriest" },
  { id: "witch", name: "Witch" },
  { id: "wizard", name: "Wizard" },
];

const supportedAppClassIds = new Set(["fighter", "rogue", "cleric", "wizard"]);

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

  if (!id) id = "unnamedArchetype";
  if (/^[0-9]/.test(id)) id = "archetype" + id;

  return id;
}

function js(value) {
  return JSON.stringify(value ?? "");
}

function parseArchetypes(html, className) {
  const results = [];

  const rowRegex = /<tr[^>]*>\s*<td[^>]*>\s*<a[^>]+href="([^"]*ArchetypeDisplay\.aspx\?FixedName=[^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;

  let match;

  while ((match = rowRegex.exec(html))) {
    const href = match[1].replace(/&amp;/g, "&");
    const name = stripTags(match[2]);
    const replaces = stripTags(match[3]);
    const summary = stripTags(match[4]);

    if (!name) continue;

    results.push({
      id: toId(name),
      name,
      replaces,
      text: summary || "SRD에서 가져온 아키타입입니다.",
      source: "Archives of Nethys",
      url: "https://www.aonprd.com/" + href,
    });
  }

  if (results.length === 0) {
    console.warn("No archetypes parsed for " + className);
  }

  return results;
}

const generatedByClass = {};
const classCatalog = [];

for (const classInfo of classList) {
  const url =
    "https://www.aonprd.com/Archetypes.aspx?Class=" +
    encodeURIComponent(classInfo.name);

  classCatalog.push({
    id: classInfo.id,
    name: classInfo.name,
    source: "Archives of Nethys",
    url,
    supportedInBuilder: supportedAppClassIds.has(classInfo.id),
  });

  if (!supportedAppClassIds.has(classInfo.id)) {
    continue;
  }

  console.log("Downloading archetypes:", classInfo.name);

  const html = await download(url);
  const archetypes = parseArchetypes(html, classInfo.name);

  generatedByClass[classInfo.id] = [
    {
      id: "none",
      name: "기본 " + classInfo.name,
      text: "아키타입을 적용하지 않은 기본 클래스입니다.",
      replaces: "",
      source: "Local",
      url: "",
    },
    ...archetypes,
  ];
}

fs.mkdirSync(path.resolve("src/data"), { recursive: true });

const archetypeCode = `export const GENERATED_ARCHETYPES_BY_CLASS: Record<
  string,
  { id: string; name: string; text: string; replaces?: string; source?: string; url?: string }[]
> = {
${Object.entries(generatedByClass)
  .map(([classId, archetypes]) => {
    return `  ${js(classId)}: [
${archetypes
  .map((item) => {
    return `    {
      id: ${js(item.id)},
      name: ${js(item.name)},
      text: ${js(item.text)},
      replaces: ${js(item.replaces || "")},
      source: ${js(item.source || "")},
      url: ${js(item.url || "")},
    }`;
  })
  .join(",\n")}
  ]`;
  })
  .join(",\n")}
};
`;

const classCatalogCode = `export const SRD_CLASS_CATALOG = [
${classCatalog
  .map((item) => {
    return `  {
    id: ${js(item.id)},
    name: ${js(item.name)},
    source: ${js(item.source)},
    url: ${js(item.url)},
    supportedInBuilder: ${item.supportedInBuilder},
  }`;
  })
  .join(",\n")}
];
`;

fs.writeFileSync("src/data/archetypes.generated.ts", archetypeCode);
fs.writeFileSync("src/data/classCatalog.generated.ts", classCatalogCode);

console.log("Generated src/data/archetypes.generated.ts");
console.log("Generated src/data/classCatalog.generated.ts");
