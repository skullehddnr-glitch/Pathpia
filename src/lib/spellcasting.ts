import type { SpellEntry } from "../data/spells";

const SPELL_CLASS_ALIASES: Record<string, string> = {
  barbarianUnchained: "barbarian",
  monkUnchained: "monk",
  rogueUnchained: "rogue",
  summonerUnchained: "summonerUnchained",
};

const SORCERER_KNOWN: number[][] = [
  [],
  [4, 2],
  [5, 2],
  [5, 3],
  [6, 3, 1],
  [6, 4, 2],
  [7, 4, 2, 1],
  [7, 5, 3, 2],
  [8, 5, 3, 2, 1],
  [8, 5, 4, 3, 2],
  [9, 5, 4, 3, 2, 1],
  [9, 5, 5, 4, 3, 2],
  [9, 5, 5, 4, 3, 2, 1],
  [9, 5, 5, 4, 4, 3, 2],
  [9, 5, 5, 4, 4, 3, 2, 1],
  [9, 5, 5, 4, 4, 4, 3, 2],
  [9, 5, 5, 4, 4, 4, 3, 2, 1],
  [9, 5, 5, 4, 4, 4, 3, 3, 2],
  [9, 5, 5, 4, 4, 4, 3, 3, 2, 1],
  [9, 5, 5, 4, 4, 4, 3, 3, 3, 2],
  [9, 5, 5, 4, 4, 4, 3, 3, 3, 3],
];

const BARD_KNOWN: number[][] = [
  [],
  [4, 2],
  [5, 3],
  [6, 4],
  [6, 4, 2],
  [6, 4, 3],
  [6, 4, 4],
  [6, 5, 4, 2],
  [6, 5, 4, 3],
  [6, 5, 4, 4],
  [6, 5, 5, 4, 2],
  [6, 6, 5, 4, 3],
  [6, 6, 5, 4, 4],
  [6, 6, 5, 5, 4, 2],
  [6, 6, 6, 5, 4, 3],
  [6, 6, 6, 5, 4, 4],
  [6, 6, 6, 5, 5, 4, 2],
  [6, 6, 6, 6, 5, 4, 3],
  [6, 6, 6, 6, 5, 4, 4],
  [6, 6, 6, 6, 5, 5, 4],
  [6, 6, 6, 6, 6, 5, 5],
];

const SIX_KNOWN = BARD_KNOWN;

const FOUR_KNOWN: number[][] = [
  [],
  [],
  [],
  [],
  [0],
  [1],
  [1],
  [2, 0],
  [2, 1],
  [3, 1],
  [3, 2, 0],
  [4, 2, 1],
  [4, 3, 1],
  [4, 3, 2, 0],
  [4, 4, 2, 1],
  [4, 4, 3, 1],
  [4, 4, 3, 2],
  [4, 4, 4, 2],
  [4, 4, 4, 3],
  [4, 4, 4, 4],
  [4, 4, 4, 4],
];

function getKnownTable(classId: string): number[][] | null {
  if (classId === "sorcerer" || classId === "oracle" || classId === "psychic") {
    return SORCERER_KNOWN;
  }

  if (
    classId === "bard" ||
    classId === "skald" ||
    classId === "inquisitor" ||
    classId === "summoner" ||
    classId === "summonerUnchained" ||
    classId === "mesmerist" ||
    classId === "medium" ||
    classId === "spiritualist"
  ) {
    return SIX_KNOWN;
  }

  if (classId === "bloodrager") {
    return FOUR_KNOWN;
  }

  return null;
}

export function makeSpellKey(classId: string, spellLevel: number) {
  return classId + ":" + spellLevel;
}

export function getSpellOptions(
  spells: SpellEntry[],
  classId: string,
  spellLevel: number
) {
  const normalizedClassId = SPELL_CLASS_ALIASES[classId] || classId;

  return spells
    .filter((spell) => spell.levels[normalizedClassId] === spellLevel)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getKnownSpellLimit(
  classId: string,
  classLevel: number,
  spellLevel: number
): number | null {
  const table = getKnownTable(classId);

  if (!table) {
    return null;
  }

  const row = table[Math.min(classLevel, table.length - 1)] || [];
  return row[spellLevel] ?? 0;
}
