export type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type SaveProgression = "good" | "poor";
export type BabProgression = "full" | "threeQuarters" | "half";
export type TabId = "basic" | "skills" | "actions" | "feats" | "spells" | "inventory";

export type SizeCategory = "Tiny" | "Small" | "Medium" | "Large";

export type RaceAbilityChoice = {
  id: string;
  label: string;
  bonus: number;
  options: Ability[];
  defaultAbility: Ability;
};

export type Race = {
  id: string;
  name: string;
  size: SizeCategory;
  speed: number;
  abilityBonuses: Partial<Record<Ability, number>>;
  abilityChoices?: RaceAbilityChoice[];
  skillBonuses?: Record<string, number>;
  traits: string[];
};

export type ClassDef = {
  id: string;
  name: string;
  hitDie: number;
  bab: BabProgression;
  saves: {
    fort: SaveProgression;
    ref: SaveProgression;
    will: SaveProgression;
  };
  skillRanks: number;
  classSkills: string[];
  features: string[];
};

export type SkillDef = {
  id: string;
  name: string;
  ability: Ability;
  armorCheckPenalty?: boolean;
  trainedOnly?: boolean;
};

export type Armor = {
  id: string;
  name: string;
  armorBonus: number;
  shieldBonus: number;
  maxDex: number | null;
  armorCheckPenalty: number;
  description: string;
};

export type Weapon = {
  id: string;
  name: string;
  attackAbility: Ability;
  damageAbility: Ability | null;
  damage: string;
  threat: string;
  crit: string;
  enhancement: number;
  melee: boolean;
  finesse?: boolean;
  description: string;
};

export type Feat = {
  id: string;
  name: string;
  type: string;
  prereq: string;
  benefit: string;
  source?: string;
  url?: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: "weapon" | "armor" | "gear" | "consumable";
  quantity: number;
  description: string;
};
