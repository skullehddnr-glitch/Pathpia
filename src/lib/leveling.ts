import type { Ability, ClassDef } from "../types";
import { CLASSES } from "../data/classes";

export const POINT_BUY_COST: Record<number, number> = {
  7: -4,
  8: -2,
  9: -1,
  10: 0,
  11: 1,
  12: 2,
  13: 3,
  14: 5,
  15: 7,
  16: 10,
  17: 13,
  18: 17,
};

export function makeDefaultClassLevels() {
  const result: Record<string, number> = {};

  for (const classDef of CLASSES) {
    result[classDef.id] = classDef.id === "fighter" ? 1 : 0;
  }

  return result;
}

export function getPointBuyCost(score: number) {
  return POINT_BUY_COST[score] ?? null;
}

export function getTotalPointBuy(scores: Record<Ability, number>) {
  let total = 0;
  let valid = true;

  for (const ability of ["str", "dex", "con", "int", "wis", "cha"] as Ability[]) {
    const cost = getPointBuyCost(scores[ability]);

    if (cost === null) {
      valid = false;
    } else {
      total += cost;
    }
  }

  return { total, valid };
}

export function getLevelIncreaseSlots(totalLevel: number) {
  const slots: number[] = [];

  for (let level = 4; level <= totalLevel; level += 4) {
    slots.push(level);
  }

  return slots;
}

export function countLevelIncreases(
  statIncreases: Record<number, Ability>,
  ability: Ability
) {
  return Object.values(statIncreases).filter((item) => item === ability).length;
}

export function getTotalLevel(classLevels: Record<string, number>) {
  return Object.values(classLevels).reduce((sum, value) => sum + value, 0);
}

export function getClassLevelSummary(classLevels: Record<string, number>) {
  const parts = CLASSES
    .filter((classDef) => (classLevels[classDef.id] || 0) > 0)
    .map((classDef) => classDef.name.split(" / ")[0] + " " + classLevels[classDef.id]);

  return parts.length > 0 ? parts.join(" / ") : "No class";
}

export function getStartingClass(
  classLevels: Record<string, number>,
  startingClassId: string
): ClassDef {
  const selected = CLASSES.find((classDef) => classDef.id === startingClassId);

  if (selected && (classLevels[selected.id] || 0) > 0) {
    return selected;
  }

  return CLASSES.find((classDef) => (classLevels[classDef.id] || 0) > 0) || CLASSES[0];
}
