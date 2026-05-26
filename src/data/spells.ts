import { GENERATED_SPELLS } from "./spells.generated";

export type SpellEntry = {
  id: string;
  name: string;
  summary: string;
  school?: string;
  source?: string;
  url?: string;
  levels: Record<string, number>;
};

export const MANUAL_SPELLS: SpellEntry[] = [
  {
    id: "magicMissile",
    name: "Magic Missile",
    summary: "자동 명중하는 force missile.",
    school: "Evocation",
    source: "Manual seed",
    url: "",
    levels: { wizard: 1, sorcerer: 1 },
  },
  {
    id: "cureLightWounds",
    name: "Cure Light Wounds",
    summary: "접촉한 생명체를 회복합니다.",
    school: "Conjuration",
    source: "Manual seed",
    url: "",
    levels: { cleric: 1, druid: 1, bard: 1, paladin: 1, ranger: 2 },
  },
  {
    id: "bless",
    name: "Bless",
    summary: "아군의 공격과 공포 내성에 보너스.",
    school: "Enchantment",
    source: "Manual seed",
    url: "",
    levels: { cleric: 1, paladin: 1 },
  },
];

export const SPELLS: SpellEntry[] = [
  ...MANUAL_SPELLS,
  ...GENERATED_SPELLS.filter(
    (generated) =>
      !MANUAL_SPELLS.some(
        (manual) => manual.name.toLowerCase() === generated.name.toLowerCase()
      )
  ),
];
