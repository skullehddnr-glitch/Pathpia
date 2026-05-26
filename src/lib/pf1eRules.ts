import type { Ability, BabProgression, SaveProgression } from "../types";

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

export function abilityMod(score: number) {
  return Math.floor((score - 10) / 2);
}

export function signed(n: number) {
  return n >= 0 ? "+" + n : String(n);
}

export function babValue(type: BabProgression, level: number) {
  if (level <= 0) return 0;
  if (type === "full") return level;
  if (type === "threeQuarters") return Math.floor(level * 0.75);
  return Math.floor(level * 0.5);
}

export function saveValue(type: SaveProgression, level: number) {
  if (level <= 0) return 0;
  if (type === "good") return 2 + Math.floor(level / 2);
  return Math.floor(level / 3);
}

export function powerAttackPenalty(bab: number) {
  if (bab < 1) return 0;
  return 1 + Math.floor((bab - 1) / 4);
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
