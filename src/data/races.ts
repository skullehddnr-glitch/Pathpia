import type { Race } from "../types";

export const RACES: Race[] = [
  {
    id: "human",
    name: "Human / 인간",
    size: "Medium",
    speed: 30,
    abilityBonuses: { str: 2 },
    traits: ["보너스 피트", "추가 스킬 랭크", "선택 능력치 +2: 현재 STR 데모 처리"],
  },
  {
    id: "elf",
    name: "Elf / 엘프",
    size: "Medium",
    speed: 30,
    abilityBonuses: { dex: 2, int: 2, con: -2 },
    skillBonuses: { perception: 2 },
    traits: ["저광시야", "수면 면역", "마법 내성 +2", "지각 +2"],
  },
  {
    id: "dwarf",
    name: "Dwarf / 드워프",
    size: "Medium",
    speed: 20,
    abilityBonuses: { con: 2, wis: 2, cha: -2 },
    traits: ["암시야 60ft", "독/주문 내성 +2", "안정성"],
  },
  {
    id: "gnome",
    name: "Gnome / 노움",
    size: "Small",
    speed: 20,
    abilityBonuses: { con: 2, cha: 2, str: -2 },
    traits: ["소형", "저광시야", "환술 DC +1", "Small 크기: AC/명중 +1, 은신 +4"],
  },
];
