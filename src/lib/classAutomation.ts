import { CLASSES } from "../data/classes";
import {
  getClassAutomation,
  SPELL_SLOT_TABLES,
  type FeatureEntry,
} from "../data/classAutomation";

export type ProgressionEntry = {
  sortLevel: number;
  displayLevel: string;
  kind: "feat" | "classFeature";
  source: string;
  name: string;
  text: string;
};

export type SpellSlotSummary = {
  classId: string;
  className: string;
  classLevel: number;
  ability: string;
  tradition: string;
  note: string;
  slots: number[];
};

export function buildInferredClassLevelOrder(
  classLevels: Record<string, number>,
  startingClassId: string
) {
  const result: string[] = [];

  const startingLevel = classLevels[startingClassId] || 0;

  for (let i = 0; i < startingLevel; i++) {
    result.push(startingClassId);
  }

  for (const classDef of CLASSES) {
    if (classDef.id === startingClassId) continue;

    const classLevel = classLevels[classDef.id] || 0;

    for (let i = 0; i < classLevel; i++) {
      result.push(classDef.id);
    }
  }

  return result;
}

export function buildClassFeatureTimeline(
  classLevels: Record<string, number>,
  startingClassId: string
): ProgressionEntry[] {
  const order = buildInferredClassLevelOrder(classLevels, startingClassId);
  const classLevelCounter: Record<string, number> = {};
  const entries: ProgressionEntry[] = [];

  for (let index = 0; index < order.length; index++) {
    const classId = order[index];
    const classDef = CLASSES.find((item) => item.id === classId);
    if (!classDef) continue;

    const characterLevel = index + 1;
    const classLevel = (classLevelCounter[classId] || 0) + 1;
    classLevelCounter[classId] = classLevel;

    const automation = getClassAutomation(classId);
    const features: FeatureEntry[] =
      automation?.features.filter((feature) => feature.level === classLevel) || [];

    for (const feature of features) {
      entries.push({
        sortLevel: characterLevel,
        displayLevel: characterLevel + "레벨 / " + classDef.name.split(" / ")[0] + " " + classLevel,
        kind: "classFeature",
        source: classDef.name,
        name: feature.name,
        text: feature.text,
      });
    }
  }

  return entries;
}

export function buildSpellSlotSummary(
  classLevels: Record<string, number>
): SpellSlotSummary[] {
  const result: SpellSlotSummary[] = [];

  for (const classDef of CLASSES) {
    const classLevel = classLevels[classDef.id] || 0;
    if (classLevel <= 0) continue;

    const automation = getClassAutomation(classDef.id);
    const spellcasting = automation?.spellcasting;

    if (!spellcasting || spellcasting.profileId === "none") {
      continue;
    }

    const table = SPELL_SLOT_TABLES[spellcasting.profileId] || [];
    const slots = table[Math.min(classLevel, table.length - 1)] || [];

    if (slots.length === 0) {
      continue;
    }

    result.push({
      classId: classDef.id,
      className: classDef.name,
      classLevel,
      ability: spellcasting.ability.toUpperCase(),
      tradition: spellcasting.tradition,
      note: spellcasting.note || "",
      slots,
    });
  }

  return result;
}

export function buildFeatTimelineEntries(
  featSlots: { id: string; label: string }[],
  selectedFeats: Record<string, string>,
  getFeatById: (id: string) => { name: string; benefit: string; type: string; prereq: string }
): ProgressionEntry[] {
  return featSlots.map((slot) => {
    const selectedId = selectedFeats[slot.id] || "none";
    const feat = getFeatById(selectedId);

    const levelMatch = slot.id.match(/(?:level|fighter)-(\d+)/);
    const sortLevel = levelMatch ? Number(levelMatch[1]) : 1;

    return {
      sortLevel,
      displayLevel: slot.label,
      kind: "feat",
      source: "Feat",
      name: feat.name,
      text: feat.benefit,
    };
  });
}
