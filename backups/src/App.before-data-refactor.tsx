import { useMemo, useState } from "react";
import "./App.css";

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"] as const;
type Ability = (typeof ABILITIES)[number];

type SaveProgression = "good" | "poor";
type BabProgression = "full" | "threeQuarters" | "half";
type TabId = "basic" | "skills" | "actions" | "feats" | "inventory";

type Race = {
  id: string;
  name: string;
  size: "Small" | "Medium";
  speed: number;
  abilityBonuses: Partial<Record<Ability, number>>;
  skillBonuses?: Record<string, number>;
  traits: string[];
};

type ClassDef = {
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

type SkillDef = {
  id: string;
  name: string;
  ability: Ability;
  armorCheckPenalty?: boolean;
  trainedOnly?: boolean;
};

type Armor = {
  id: string;
  name: string;
  armorBonus: number;
  shieldBonus: number;
  maxDex: number | null;
  armorCheckPenalty: number;
  description: string;
};

type Weapon = {
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

type Feat = {
  id: string;
  name: string;
  type: string;
  prereq: string;
  benefit: string;
};

type InventoryItem = {
  id: string;
  name: string;
  category: "weapon" | "armor" | "gear" | "consumable";
  quantity: number;
  description: string;
};

const abilityNames: Record<Ability, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};

const tabLabels: Record<TabId, string> = {
  basic: "기본정보",
  skills: "스킬",
  actions: "행동",
  feats: "피트",
  inventory: "인벤토리",
};

const RACES: Race[] = [
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

const CLASSES: ClassDef[] = [
  {
    id: "fighter",
    name: "Fighter / 파이터",
    hitDie: 10,
    bab: "full",
    saves: { fort: "good", ref: "poor", will: "poor" },
    skillRanks: 2,
    classSkills: ["climb", "craft", "handleAnimal", "intimidate", "profession", "ride", "survival", "swim"],
    features: ["Bonus Feats", "Bravery", "Armor Training", "Weapon Training"],
  },
  {
    id: "rogue",
    name: "Rogue / 로그",
    hitDie: 8,
    bab: "threeQuarters",
    saves: { fort: "poor", ref: "good", will: "poor" },
    skillRanks: 8,
    classSkills: [
      "acrobatics",
      "appraise",
      "bluff",
      "climb",
      "craft",
      "diplomacy",
      "disableDevice",
      "disguise",
      "escapeArtist",
      "intimidate",
      "knowledgeLocal",
      "perception",
      "profession",
      "senseMotive",
      "sleightOfHand",
      "stealth",
      "swim",
      "useMagicDevice",
    ],
    features: ["Sneak Attack", "Trapfinding", "Evasion", "Rogue Talents"],
  },
  {
    id: "cleric",
    name: "Cleric / 클레릭",
    hitDie: 8,
    bab: "threeQuarters",
    saves: { fort: "good", ref: "poor", will: "good" },
    skillRanks: 2,
    classSkills: [
      "appraise",
      "craft",
      "diplomacy",
      "heal",
      "knowledgeArcana",
      "knowledgeHistory",
      "knowledgeNobility",
      "knowledgePlanes",
      "knowledgeReligion",
      "linguistics",
      "profession",
      "senseMotive",
      "spellcraft",
    ],
    features: ["Aura", "Channel Energy", "Domains", "Spontaneous Casting"],
  },
  {
    id: "wizard",
    name: "Wizard / 위저드",
    hitDie: 6,
    bab: "half",
    saves: { fort: "poor", ref: "poor", will: "good" },
    skillRanks: 2,
    classSkills: [
      "appraise",
      "craft",
      "fly",
      "knowledgeArcana",
      "knowledgeDungeoneering",
      "knowledgeEngineering",
      "knowledgeGeography",
      "knowledgeHistory",
      "knowledgeLocal",
      "knowledgeNature",
      "knowledgeNobility",
      "knowledgePlanes",
      "knowledgeReligion",
      "linguistics",
      "profession",
      "spellcraft",
    ],
    features: ["Arcane Bond", "Arcane School", "Cantrips", "Scribe Scroll"],
  },
];

const SKILLS: SkillDef[] = [
  { id: "acrobatics", name: "Acrobatics / 곡예", ability: "dex", armorCheckPenalty: true },
  { id: "appraise", name: "Appraise / 감정", ability: "int" },
  { id: "bluff", name: "Bluff / 허세", ability: "cha" },
  { id: "climb", name: "Climb / 등반", ability: "str", armorCheckPenalty: true },
  { id: "craft", name: "Craft / 제작", ability: "int" },
  { id: "diplomacy", name: "Diplomacy / 교섭", ability: "cha" },
  { id: "disableDevice", name: "Disable Device / 장치해제", ability: "dex", armorCheckPenalty: true, trainedOnly: true },
  { id: "disguise", name: "Disguise / 변장", ability: "cha" },
  { id: "escapeArtist", name: "Escape Artist / 탈출술", ability: "dex", armorCheckPenalty: true },
  { id: "fly", name: "Fly / 비행", ability: "dex", armorCheckPenalty: true },
  { id: "handleAnimal", name: "Handle Animal / 동물다루기", ability: "cha", trainedOnly: true },
  { id: "heal", name: "Heal / 치료", ability: "wis" },
  { id: "intimidate", name: "Intimidate / 위협", ability: "cha" },
  { id: "knowledgeArcana", name: "Knowledge Arcana / 지식: 비전", ability: "int", trainedOnly: true },
  { id: "knowledgeDungeoneering", name: "Knowledge Dungeoneering / 지식: 던전", ability: "int", trainedOnly: true },
  { id: "knowledgeEngineering", name: "Knowledge Engineering / 지식: 공학", ability: "int", trainedOnly: true },
  { id: "knowledgeGeography", name: "Knowledge Geography / 지식: 지리", ability: "int", trainedOnly: true },
  { id: "knowledgeHistory", name: "Knowledge History / 지식: 역사", ability: "int", trainedOnly: true },
  { id: "knowledgeLocal", name: "Knowledge Local / 지식: 지역", ability: "int", trainedOnly: true },
  { id: "knowledgeNature", name: "Knowledge Nature / 지식: 자연", ability: "int", trainedOnly: true },
  { id: "knowledgeNobility", name: "Knowledge Nobility / 지식: 귀족", ability: "int", trainedOnly: true },
  { id: "knowledgePlanes", name: "Knowledge Planes / 지식: 차원", ability: "int", trainedOnly: true },
  { id: "knowledgeReligion", name: "Knowledge Religion / 지식: 종교", ability: "int", trainedOnly: true },
  { id: "linguistics", name: "Linguistics / 언어학", ability: "int", trainedOnly: true },
  { id: "perception", name: "Perception / 지각", ability: "wis" },
  { id: "profession", name: "Profession / 전문직", ability: "wis", trainedOnly: true },
  { id: "ride", name: "Ride / 기승", ability: "dex", armorCheckPenalty: true },
  { id: "senseMotive", name: "Sense Motive / 동기파악", ability: "wis" },
  { id: "sleightOfHand", name: "Sleight of Hand / 손재주", ability: "dex", armorCheckPenalty: true, trainedOnly: true },
  { id: "spellcraft", name: "Spellcraft / 주문학", ability: "int", trainedOnly: true },
  { id: "stealth", name: "Stealth / 은신", ability: "dex", armorCheckPenalty: true },
  { id: "survival", name: "Survival / 생존", ability: "wis" },
  { id: "swim", name: "Swim / 수영", ability: "str", armorCheckPenalty: true },
  { id: "useMagicDevice", name: "Use Magic Device / 마법장치사용", ability: "cha", trainedOnly: true },
];

const ARMORS: Armor[] = [
  { id: "none", name: "No Armor / 무갑옷", armorBonus: 0, shieldBonus: 0, maxDex: null, armorCheckPenalty: 0, description: "방어구 없음." },
  { id: "leather", name: "Leather Armor / 가죽 갑옷", armorBonus: 2, shieldBonus: 0, maxDex: 6, armorCheckPenalty: 0, description: "가벼운 갑옷." },
  { id: "chainShirt", name: "Chain Shirt / 체인 셔츠", armorBonus: 4, shieldBonus: 0, maxDex: 4, armorCheckPenalty: -2, description: "초반 전투 캐릭터에게 자주 쓰이는 가벼운 갑옷." },
  { id: "breastplate", name: "Breastplate / 브레스트플레이트", armorBonus: 6, shieldBonus: 0, maxDex: 3, armorCheckPenalty: -4, description: "중형 갑옷. AC는 높지만 스킬 페널티가 크다." },
  { id: "heavyShield", name: "Heavy Shield only / 헤비 실드만", armorBonus: 0, shieldBonus: 2, maxDex: null, armorCheckPenalty: -2, description: "방패만 장착한 상태." },
  { id: "chainAndShield", name: "Chain Shirt + Heavy Shield", armorBonus: 4, shieldBonus: 2, maxDex: 4, armorCheckPenalty: -4, description: "체인 셔츠와 헤비 실드를 함께 사용하는 데모 장비." },
];

const WEAPONS: Weapon[] = [
  { id: "longsword", name: "Longsword / 롱소드", attackAbility: "str", damageAbility: "str", damage: "1d8", threat: "19-20", crit: "x2", enhancement: 0, melee: true, description: "표준적인 한손 근접 무기." },
  { id: "rapier", name: "Rapier / 레이피어", attackAbility: "str", damageAbility: "str", damage: "1d6", threat: "18-20", crit: "x2", enhancement: 0, melee: true, finesse: true, description: "Weapon Finesse가 있으면 명중에 DEX 사용 가능." },
  { id: "dagger", name: "Dagger / 대거", attackAbility: "str", damageAbility: "str", damage: "1d4", threat: "19-20", crit: "x2", enhancement: 0, melee: true, finesse: true, description: "가벼운 보조 무기." },
  { id: "shortbow", name: "Shortbow / 숏보우", attackAbility: "dex", damageAbility: null, damage: "1d6", threat: "20", crit: "x3", enhancement: 0, melee: false, description: "원거리 무기. 피해에 능력치 보정 없음으로 처리." },
];

const FEATS: Feat[] = [
  { id: "none", name: "선택 안 함", type: "-", prereq: "-", benefit: "아직 선택하지 않은 슬롯입니다." },
  { id: "powerAttack", name: "Power Attack", type: "Combat", prereq: "Str 13, BAB +1", benefit: "근접 공격 명중을 낮추고 피해를 증가시킨다. 행동 탭에서 토글 가능." },
  { id: "weaponFinesse", name: "Weapon Finesse", type: "Combat", prereq: "-", benefit: "일부 가벼운 무기와 레이피어 등의 명중 굴림에 DEX를 사용할 수 있다." },
  { id: "toughness", name: "Toughness", type: "General", prereq: "-", benefit: "HP가 증가한다. 현재 프로토타입에서는 최소 +3, 이후 레벨에 따라 증가." },
  { id: "improvedInitiative", name: "Improved Initiative", type: "Combat", prereq: "-", benefit: "우선권에 +4 보너스." },
  { id: "combatCasting", name: "Combat Casting", type: "General", prereq: "-", benefit: "방어적 시전 및 그래플 중 시전 집중 판정에 +4." },
];

const CLASS_FEATURE_CHOICES: Record<string, { id: string; label: string; options: { id: string; name: string; text: string }[] }[]> = {
  fighter: [
    {
      id: "weaponGroup",
      label: "Weapon Training Group / 무기 훈련 그룹",
      options: [
        { id: "bladesHeavy", name: "Heavy Blades", text: "롱소드, 그레이트소드 등 중검 계열을 강화하는 선택지." },
        { id: "bows", name: "Bows", text: "장궁, 단궁 등 활 계열을 강화하는 선택지." },
        { id: "close", name: "Close", text: "근접 난전용 짧은 무기 계열을 강화하는 선택지." },
      ],
    },
  ],
  rogue: [
    {
      id: "rogueTalent",
      label: "Rogue Talent / 로그 재능",
      options: [
        { id: "finesseRogue", name: "Finesse Rogue", text: "Weapon Finesse를 보너스 피트로 얻는 방향의 예시 선택지." },
        { id: "combatTrick", name: "Combat Trick", text: "전투 피트를 하나 얻는 로그 재능 예시." },
        { id: "fastStealth", name: "Fast Stealth", text: "은신 이동 관련 재능 예시." },
      ],
    },
  ],
  cleric: [
    {
      id: "domainOne",
      label: "Domain 1 / 도메인 1",
      options: [
        { id: "war", name: "War", text: "전투와 무기 사용에 어울리는 도메인 예시." },
        { id: "healing", name: "Healing", text: "회복 능력에 초점을 둔 도메인 예시." },
        { id: "travel", name: "Travel", text: "이동성과 탐험에 초점을 둔 도메인 예시." },
      ],
    },
    {
      id: "domainTwo",
      label: "Domain 2 / 도메인 2",
      options: [
        { id: "knowledge", name: "Knowledge", text: "지식과 판정 보조에 어울리는 도메인 예시." },
        { id: "protection", name: "Protection", text: "방어와 보호에 초점을 둔 도메인 예시." },
        { id: "sun", name: "Sun", text: "언데드와 빛 테마에 어울리는 도메인 예시." },
      ],
    },
  ],
  wizard: [
    {
      id: "arcaneSchool",
      label: "Arcane School / 비전 학파",
      options: [
        { id: "universalist", name: "Universalist", text: "특정 학파에 묶이지 않는 범용 위저드." },
        { id: "evocation", name: "Evocation", text: "피해 주문과 에너지 조작에 초점을 둔 학파." },
        { id: "conjuration", name: "Conjuration", text: "소환, 이동, 창조 주문에 초점을 둔 학파." },
      ],
    },
  ],
};

function makeDefaultSkillRanks() {
  const result: Record<string, number> = {};
  for (const skill of SKILLS) {
    result[skill.id] = 0;
  }
  return result;
}

function makeDefaultInventory() {
  const result: Record<string, number> = {};
  for (const weapon of WEAPONS) {
    result["weapon:" + weapon.id] = weapon.id === "longsword" ? 1 : 0;
  }
  for (const armor of ARMORS) {
    result["armor:" + armor.id] = armor.id === "chainShirt" ? 1 : 0;
  }
  result["gear:backpack"] = 1;
  result["gear:rope"] = 1;
  result["consumable:potionCureLight"] = 2;
  return result;
}

function abilityMod(score: number) {
  return Math.floor((score - 10) / 2);
}

function signed(n: number) {
  return n >= 0 ? "+" + n : String(n);
}

function babValue(type: BabProgression, level: number) {
  if (type === "full") return level;
  if (type === "threeQuarters") return Math.floor(level * 0.75);
  return Math.floor(level * 0.5);
}

function saveValue(type: SaveProgression, level: number) {
  if (type === "good") return 2 + Math.floor(level / 2);
  return Math.floor(level / 3);
}

function powerAttackPenalty(bab: number) {
  if (bab < 1) return 0;
  return 1 + Math.floor((bab - 1) / 4);
}

function getFeatSlots(level: number, raceId: string, classId: string) {
  const slots: { id: string; label: string }[] = [];

  for (let current = 1; current <= level; current += 2) {
    slots.push({ id: "level-" + current, label: current + "레벨 일반 피트" });
  }

  if (raceId === "human") {
    slots.push({ id: "human-bonus", label: "인간 보너스 피트" });
  }

  if (classId === "fighter") {
    for (let current = 1; current <= level; current++) {
      if (current === 1 || current % 2 === 0) {
        slots.push({ id: "fighter-" + current, label: current + "레벨 파이터 보너스 피트" });
      }
    }
  }

  return slots;
}

function getFeatById(id: string) {
  return FEATS.find((feat) => feat.id === id) || FEATS[0];
}

function buildInventoryItems(inventory: Record<string, number>) {
  const items: InventoryItem[] = [];

  for (const weapon of WEAPONS) {
    items.push({
      id: "weapon:" + weapon.id,
      name: weapon.name,
      category: "weapon",
      quantity: inventory["weapon:" + weapon.id] || 0,
      description: weapon.description,
    });
  }

  for (const armor of ARMORS) {
    if (armor.id !== "none") {
      items.push({
        id: "armor:" + armor.id,
        name: armor.name,
        category: "armor",
        quantity: inventory["armor:" + armor.id] || 0,
        description: armor.description,
      });
    }
  }

  items.push({
    id: "gear:backpack",
    name: "Backpack / 배낭",
    category: "gear",
    quantity: inventory["gear:backpack"] || 0,
    description: "일반 장비 보관용 배낭.",
  });

  items.push({
    id: "gear:rope",
    name: "Rope / 밧줄",
    category: "gear",
    quantity: inventory["gear:rope"] || 0,
    description: "탐험용 밧줄.",
  });

  items.push({
    id: "consumable:potionCureLight",
    name: "Potion of Cure Light Wounds / 경상 치료 물약",
    category: "consumable",
    quantity: inventory["consumable:potionCureLight"] || 0,
    description: "회복 물약 예시 아이템.",
  });

  return items;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [name, setName] = useState("Aldren Demo");
  const [raceId, setRaceId] = useState("human");
  const [classId, setClassId] = useState("fighter");
  const [level, setLevel] = useState(1);
  const [selectedArmorId, setSelectedArmorId] = useState("chainShirt");
  const [selectedWeaponId, setSelectedWeaponId] = useState("longsword");
  const [powerAttackOn, setPowerAttackOn] = useState(false);
  const [skillRanks, setSkillRanks] = useState<Record<string, number>>(() => makeDefaultSkillRanks());
  const [selectedFeats, setSelectedFeats] = useState<Record<string, string>>({});
  const [classChoices, setClassChoices] = useState<Record<string, string>>({});
  const [inventory, setInventory] = useState<Record<string, number>>(() => makeDefaultInventory());

  const [baseScores, setBaseScores] = useState<Record<Ability, number>>({
    str: 15,
    dex: 14,
    con: 13,
    int: 12,
    wis: 10,
    cha: 8,
  });

  const race = RACES.find((item) => item.id === raceId) || RACES[0];
  const classDef = CLASSES.find((item) => item.id === classId) || CLASSES[0];
  const armor = ARMORS.find((item) => item.id === selectedArmorId) || ARMORS[0];
  const weapon = WEAPONS.find((item) => item.id === selectedWeaponId) || WEAPONS[0];

  const featSlots = getFeatSlots(level, raceId, classId);
  const chosenFeatIds = Object.values(selectedFeats).filter((id) => id && id !== "none");
  const classChoiceGroups = CLASS_FEATURE_CHOICES[classId] || [];
  const inventoryItems = buildInventoryItems(inventory);

  const derived = useMemo(() => {
    const finalScores = { ...baseScores };

    for (const ability of ABILITIES) {
      finalScores[ability] += race.abilityBonuses[ability] || 0;
    }

    const mods: Record<Ability, number> = {
      str: abilityMod(finalScores.str),
      dex: abilityMod(finalScores.dex),
      con: abilityMod(finalScores.con),
      int: abilityMod(finalScores.int),
      wis: abilityMod(finalScores.wis),
      cha: abilityMod(finalScores.cha),
    };

    const bab = babValue(classDef.bab, level);
    const sizeAc = race.size === "Small" ? 1 : 0;
    const sizeAttack = race.size === "Small" ? 1 : 0;
    const sizeCmbCmd = race.size === "Small" ? -1 : 0;
    const sizeStealth = race.size === "Small" ? 4 : 0;

    const dexForAc = armor.maxDex === null ? mods.dex : Math.min(mods.dex, armor.maxDex);
    const hasToughness = chosenFeatIds.includes("toughness");
    const hasImprovedInitiative = chosenFeatIds.includes("improvedInitiative");
    const hasWeaponFinesse = chosenFeatIds.includes("weaponFinesse");
    const hasPowerAttack = chosenFeatIds.includes("powerAttack");

    const toughnessHp = hasToughness ? Math.max(3, level) : 0;

    const hp =
      classDef.hitDie +
      mods.con +
      (level - 1) * (Math.ceil(classDef.hitDie / 2) + mods.con) +
      toughnessHp;

    const ac = 10 + dexForAc + sizeAc + armor.armorBonus + armor.shieldBonus;
    const touchAc = 10 + mods.dex + sizeAc;
    const flatFootedAc = 10 + sizeAc + armor.armorBonus + armor.shieldBonus;

    const initiative = mods.dex + (hasImprovedInitiative ? 4 : 0);

    const finesseApplies = hasWeaponFinesse && weapon.finesse === true;
    const attackAbility = finesseApplies ? "dex" : weapon.attackAbility;

    const paPenalty = hasPowerAttack && powerAttackOn && weapon.melee ? powerAttackPenalty(bab) : 0;
    const paDamage = hasPowerAttack && powerAttackOn && weapon.melee ? powerAttackPenalty(bab) * 2 : 0;

    const attack = bab + mods[attackAbility] + sizeAttack + weapon.enhancement - paPenalty;
    const damageBonus =
      (weapon.damageAbility === null ? 0 : mods[weapon.damageAbility]) +
      weapon.enhancement +
      paDamage;

    const fort = saveValue(classDef.saves.fort, level) + mods.con;
    const ref = saveValue(classDef.saves.ref, level) + mods.dex;
    const will = saveValue(classDef.saves.will, level) + mods.wis;

    const cmb = bab + mods.str + sizeCmbCmd;
    const cmd = 10 + bab + mods.str + mods.dex + sizeCmbCmd;

    const skillRanksPerLevel =
      Math.max(1, classDef.skillRanks + mods.int) + (race.id === "human" ? 1 : 0);

    const skillRows = SKILLS.map((skill) => {
      const ranks = skillRanks[skill.id] || 0;
      const isClassSkill = classDef.classSkills.includes(skill.id);
      const classSkillBonus = isClassSkill && ranks > 0 ? 3 : 0;
      const armorPenalty = skill.armorCheckPenalty ? armor.armorCheckPenalty : 0;
      const racialBonus = race.skillBonuses ? race.skillBonuses[skill.id] || 0 : 0;
      const sizeBonus = skill.id === "stealth" ? sizeStealth : 0;
      const total =
        ranks +
        mods[skill.ability] +
        classSkillBonus +
        armorPenalty +
        racialBonus +
        sizeBonus;

      return {
        ...skill,
        ranks,
        isClassSkill,
        classSkillBonus,
        armorPenalty,
        racialBonus,
        sizeBonus,
        total,
      };
    });

    const spentSkillRanks = Object.values(skillRanks).reduce((sum, value) => sum + value, 0);

    return {
      finalScores,
      mods,
      bab,
      hp,
      ac,
      touchAc,
      flatFootedAc,
      initiative,
      attackAbility,
      attack,
      damageBonus,
      fort,
      ref,
      will,
      cmb,
      cmd,
      skillRanksPerLevel,
      totalSkillRanks: skillRanksPerLevel * level,
      spentSkillRanks,
      skillRows,
      hasPowerAttack,
      paPenalty,
      paDamage,
    };
  }, [
    baseScores,
    race,
    classDef,
    armor,
    weapon,
    level,
    skillRanks,
    chosenFeatIds.join(","),
    powerAttackOn,
  ]);

  function changeScore(ability: Ability, value: number) {
    setBaseScores((prev) => ({
      ...prev,
      [ability]: Math.max(1, Math.min(30, value || 1)),
    }));
  }

  function changeSkillRank(skillId: string, value: number) {
    setSkillRanks((prev) => ({
      ...prev,
      [skillId]: Math.max(0, Math.min(level, value || 0)),
    }));
  }

  function changeFeat(slotId: string, featId: string) {
    setSelectedFeats((prev) => ({
      ...prev,
      [slotId]: featId,
    }));
  }

  function changeClassChoice(choiceId: string, optionId: string) {
    setClassChoices((prev) => ({
      ...prev,
      [choiceId]: optionId,
    }));
  }

  function changeInventoryQuantity(itemId: string, value: number) {
    setInventory((prev) => ({
      ...prev,
      [itemId]: Math.max(0, value || 0),
    }));
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Pathpia</p>
          <h1>패스피아 - 패스파인더 1e 캐릭터 빌더</h1>
          <p className="muted">
            PF1e 캐릭터의 기본 정보, 스킬, 행동, 피트, 인벤토리를 탭으로 나누어 관리하는 프로토타입입니다.
          </p>
        </div>
      </section>

      <nav className="tabs">
        {(["basic", "skills", "actions", "feats", "inventory"] as TabId[]).map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </nav>

      {activeTab === "basic" && (
        <section className="tab-panel">
          <div className="grid">
            <div className="panel">
              <h2>기본정보</h2>

              <label>Character Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />

              <div className="select-grid">
                <div>
                  <label>Race</label>
                  <select value={raceId} onChange={(e) => setRaceId(e.target.value)}>
                    {RACES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Class</label>
                  <select value={classId} onChange={(e) => setClassId(e.target.value)}>
                    {CLASSES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label>Level: {level}</label>
              <input
                type="range"
                min={1}
                max={20}
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
              />

              <div className="ability-grid">
                {ABILITIES.map((ability) => (
                  <div className="ability" key={ability}>
                    <div className="ability-header">
                      <strong>{abilityNames[ability]}</strong>
                      <span>{signed(derived.mods[ability])}</span>
                    </div>

                    <input
                      type="number"
                      value={baseScores[ability]}
                      onChange={(e) => changeScore(ability, Number(e.target.value))}
                    />

                    <p className="small">final {derived.finalScores[ability]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <h2>방어와 주요 수치</h2>

              <div className="stats">
                <Stat label="HP" value={String(derived.hp)} />
                <Stat label="AC" value={String(derived.ac)} />
                <Stat label="Touch AC" value={String(derived.touchAc)} />
                <Stat label="Flat-footed" value={String(derived.flatFootedAc)} />
                <Stat label="Initiative" value={signed(derived.initiative)} />
                <Stat label="BAB" value={signed(derived.bab)} />
                <Stat label="Fort" value={signed(derived.fort)} />
                <Stat label="Ref" value={signed(derived.ref)} />
                <Stat label="Will" value={signed(derived.will)} />
              </div>

              <div className="details">
                <h3>현재 장착 방어구</h3>
                <p className="muted">{armor.name}</p>
                <p className="muted">
                  Armor {armor.armorBonus} / Shield {armor.shieldBonus} / Max Dex{" "}
                  {armor.maxDex === null ? "—" : armor.maxDex} / ACP {armor.armorCheckPenalty}
                </p>

                <h3>Race Traits</h3>
                <div className="tag-list">
                  {race.traits.map((trait) => (
                    <span key={trait}>{trait}</span>
                  ))}
                </div>

                <h3>Class Features</h3>
                <div className="tag-list">
                  {classDef.features.map((feature) => (
                    <span key={feature}>{feature}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "skills" && (
        <section className="tab-panel">
          <div className="wide-panel">
            <div className="skill-header">
              <div>
                <h2>스킬</h2>
                <p className="muted">
                  클래스 스킬은 랭크가 1 이상이면 +3 보너스를 받습니다. 현재 장착 방어구의 ACP도 자동 적용됩니다.
                </p>
              </div>

              <div className={derived.spentSkillRanks > derived.totalSkillRanks ? "rank-bad" : "rank-good"}>
                {derived.spentSkillRanks} / {derived.totalSkillRanks}
              </div>
            </div>

            <div className="skill-list">
              {derived.skillRows.map((skill) => (
                <div className="skill-row" key={skill.id}>
                  <div>
                    <strong>{skill.name}</strong>
                    <div className="skill-tags">
                      <span>{abilityNames[skill.ability]}</span>
                      {skill.isClassSkill && <span>class</span>}
                      {skill.armorCheckPenalty && <span>ACP</span>}
                      {skill.trainedOnly && <span>trained</span>}
                      {skill.racialBonus !== 0 && <span>racial {signed(skill.racialBonus)}</span>}
                      {skill.sizeBonus !== 0 && <span>size {signed(skill.sizeBonus)}</span>}
                    </div>
                  </div>

                  <input
                    className="rank-input"
                    type="number"
                    min={0}
                    max={level}
                    value={skill.ranks}
                    onChange={(e) => changeSkillRank(skill.id, Number(e.target.value))}
                  />

                  <div className="skill-total">{signed(skill.total)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === "actions" && (
        <section className="tab-panel">
          <div className="grid">
            <div className="panel">
              <h2>무기 공격</h2>

              <label>사용 무기</label>
              <select value={selectedWeaponId} onChange={(e) => setSelectedWeaponId(e.target.value)}>
                {WEAPONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <div className="action-card">
                <h3>{weapon.name}</h3>
                <div className="stats">
                  <Stat label="Attack" value={signed(derived.attack)} />
                  <Stat label="Damage" value={weapon.damage + signed(derived.damageBonus)} />
                  <Stat label="Crit" value={weapon.threat + " / " + weapon.crit} />
                  <Stat label="Ability" value={abilityNames[derived.attackAbility]} />
                </div>
                <p className="muted">{weapon.description}</p>
              </div>

              {derived.hasPowerAttack && weapon.melee && (
                <label className="checkbox-line">
                  <input
                    type="checkbox"
                    checked={powerAttackOn}
                    onChange={(e) => setPowerAttackOn(e.target.checked)}
                  />
                  Power Attack 적용: 명중 {signed(-derived.paPenalty)}, 피해 {signed(derived.paDamage)}
                </label>
              )}
            </div>

            <div className="panel">
              <h2>전투 중 행동과 매뉴버</h2>

              <div className="stats">
                <Stat label="CMB" value={signed(derived.cmb)} />
                <Stat label="CMD" value={String(derived.cmd)} />
                <Stat label="Trip" value={signed(derived.cmb)} />
                <Stat label="Disarm" value={signed(derived.cmb)} />
                <Stat label="Grapple" value={signed(derived.cmb)} />
                <Stat label="Bull Rush" value={signed(derived.cmb)} />
              </div>

              <div className="details">
                <h3>기본 행동 목록</h3>
                <ul className="simple-list">
                  <li>Standard Action: 공격, 주문 시전, 특수 능력 사용</li>
                  <li>Move Action: 이동, 무기 뽑기, 문 열기</li>
                  <li>Swift Action: 일부 클래스 능력 또는 주문</li>
                  <li>Full-Round Action: 전력 공격, 일부 주문, 돌진 등</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "feats" && (
        <section className="tab-panel">
          <div className="grid">
            <div className="panel">
              <h2>피트 선택</h2>

              {featSlots.map((slot) => {
                const selectedId = selectedFeats[slot.id] || "none";
                const feat = getFeatById(selectedId);

                return (
                  <div className="choice-block" key={slot.id}>
                    <label>{slot.label}</label>
                    <select value={selectedId} onChange={(e) => changeFeat(slot.id, e.target.value)}>
                      {FEATS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <p className="muted">
                      {feat.type} / Prereq: {feat.prereq}
                    </p>
                    <p>{feat.benefit}</p>
                  </div>
                );
              })}
            </div>

            <div className="panel">
              <h2>클래스 피처 선택</h2>

              {classChoiceGroups.length === 0 && (
                <p className="muted">현재 클래스에는 선택형 피처 예시가 없습니다.</p>
              )}

              {classChoiceGroups.map((group) => {
                const selectedOptionId = classChoices[group.id] || group.options[0].id;
                const selectedOption =
                  group.options.find((option) => option.id === selectedOptionId) || group.options[0];

                return (
                  <div className="choice-block" key={group.id}>
                    <label>{group.label}</label>
                    <select
                      value={selectedOptionId}
                      onChange={(e) => changeClassChoice(group.id, e.target.value)}
                    >
                      {group.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <p>{selectedOption.text}</p>
                  </div>
                );
              })}

              <div className="details">
                <h3>현재 클래스 기본 피처</h3>
                <div className="tag-list">
                  {classDef.features.map((feature) => (
                    <span key={feature}>{feature}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "inventory" && (
        <section className="tab-panel">
          <div className="grid">
            <div className="panel">
              <h2>장착 장비</h2>

              <label>장착 방어구 / 방패</label>
              <select value={selectedArmorId} onChange={(e) => setSelectedArmorId(e.target.value)}>
                {ARMORS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <p className="muted">{armor.description}</p>
              <p className="muted">
                이 선택은 기본정보 탭의 AC와 스킬 탭의 ACP에 반영됩니다.
              </p>

              <label>주 사용 무기</label>
              <select value={selectedWeaponId} onChange={(e) => setSelectedWeaponId(e.target.value)}>
                {WEAPONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <p className="muted">{weapon.description}</p>
              <p className="muted">
                이 선택은 행동 탭의 무기 공격 명중과 피해에 반영됩니다.
              </p>
            </div>

            <div className="panel">
              <h2>인벤토리 목록</h2>

              <div className="inventory-list">
                {inventoryItems.map((item) => (
                  <div className="inventory-row" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <p className="muted">{item.category} / {item.description}</p>
                    </div>

                    <input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(e) => changeInventoryQuantity(item.id, Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
