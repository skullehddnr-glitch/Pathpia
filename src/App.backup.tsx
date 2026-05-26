import { useMemo, useState } from "react";
import "./App.css";

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"] as const;
type Ability = (typeof ABILITIES)[number];

type SaveProgression = "good" | "poor";
type BabProgression = "full" | "threeQuarters" | "half";

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
  { id: "none", name: "No Armor / 무갑옷", armorBonus: 0, shieldBonus: 0, maxDex: null, armorCheckPenalty: 0 },
  { id: "leather", name: "Leather Armor / 가죽 갑옷", armorBonus: 2, shieldBonus: 0, maxDex: 6, armorCheckPenalty: 0 },
  { id: "chainShirt", name: "Chain Shirt / 체인 셔츠", armorBonus: 4, shieldBonus: 0, maxDex: 4, armorCheckPenalty: -2 },
  { id: "breastplate", name: "Breastplate / 브레스트플레이트", armorBonus: 6, shieldBonus: 0, maxDex: 3, armorCheckPenalty: -4 },
  { id: "heavyShield", name: "Heavy Shield only / 헤비 실드만", armorBonus: 0, shieldBonus: 2, maxDex: null, armorCheckPenalty: -2 },
  { id: "chainAndShield", name: "Chain Shirt + Heavy Shield", armorBonus: 4, shieldBonus: 2, maxDex: 4, armorCheckPenalty: -4 },
];

const abilityNames: Record<Ability, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};

function makeDefaultSkillRanks() {
  const result: Record<string, number> = {};
  for (const skill of SKILLS) {
    result[skill.id] = 0;
  }
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

export default function App() {
  const [name, setName] = useState("Aldren Demo");
  const [raceId, setRaceId] = useState("human");
  const [classId, setClassId] = useState("fighter");
  const [armorId, setArmorId] = useState("chainShirt");
  const [level, setLevel] = useState(1);
  const [skillRanks, setSkillRanks] = useState<Record<string, number>>(() => makeDefaultSkillRanks());

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
  const armor = ARMORS.find((item) => item.id === armorId) || ARMORS[0];

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
    const sizeStealth = race.size === "Small" ? 4 : 0;

    const dexForAc = armor.maxDex === null ? mods.dex : Math.min(mods.dex, armor.maxDex);

    const hp =
      classDef.hitDie +
      mods.con +
      (level - 1) * (Math.ceil(classDef.hitDie / 2) + mods.con);

    const ac = 10 + dexForAc + sizeAc + armor.armorBonus + armor.shieldBonus;
    const touchAc = 10 + mods.dex + sizeAc;
    const flatFootedAc = 10 + sizeAc + armor.armorBonus + armor.shieldBonus;

    const attack = bab + mods.str + sizeAttack;

    const fort = saveValue(classDef.saves.fort, level) + mods.con;
    const ref = saveValue(classDef.saves.ref, level) + mods.dex;
    const will = saveValue(classDef.saves.will, level) + mods.wis;

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
      attack,
      fort,
      ref,
      will,
      skillRanksPerLevel,
      totalSkillRanks: skillRanksPerLevel * level,
      spentSkillRanks,
      skillRows,
    };
  }, [baseScores, race, classDef, armor, level, skillRanks]);

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

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">PF1e Sheet Dev Build</p>
          <h1>Pathfinder 1e Web Sheet</h1>
          <p className="muted">
            종족, 클래스, 방어구, 스킬 랭크를 선택하면 주요 수치가 자동 계산됩니다.
          </p>
        </div>
      </section>

      <section className="grid">
        <div className="panel">
          <h2>Character</h2>

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

          <label>Armor</label>
          <select value={armorId} onChange={(e) => setArmorId(e.target.value)}>
            {ARMORS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

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
          <h2>Derived Stats</h2>

          <div className="stats">
            <div>
              <span>HP</span>
              <strong>{derived.hp}</strong>
            </div>
            <div>
              <span>AC</span>
              <strong>{derived.ac}</strong>
            </div>
            <div>
              <span>Touch AC</span>
              <strong>{derived.touchAc}</strong>
            </div>
            <div>
              <span>Flat-footed</span>
              <strong>{derived.flatFootedAc}</strong>
            </div>
            <div>
              <span>BAB</span>
              <strong>{signed(derived.bab)}</strong>
            </div>
            <div>
              <span>Attack</span>
              <strong>{signed(derived.attack)}</strong>
            </div>
            <div>
              <span>Fort</span>
              <strong>{signed(derived.fort)}</strong>
            </div>
            <div>
              <span>Ref</span>
              <strong>{signed(derived.ref)}</strong>
            </div>
            <div>
              <span>Will</span>
              <strong>{signed(derived.will)}</strong>
            </div>
            <div>
              <span>Skill Ranks</span>
              <strong>
                {derived.spentSkillRanks} / {derived.totalSkillRanks}
              </strong>
            </div>
          </div>

          <div className="details">
            <h3>Race Traits</h3>
            <div className="tag-list">
              {race.traits.map((trait) => (
                <span key={trait}>{trait}</span>
              ))}
            </div>

            <h3>Class Info</h3>
            <p className="muted">
              Hit Die d{classDef.hitDie} / BAB {classDef.bab} / Skill ranks{" "}
              {classDef.skillRanks}+INT
            </p>

            <h3>Armor Info</h3>
            <p className="muted">
              Armor {armor.armorBonus} / Shield {armor.shieldBonus} / Max Dex{" "}
              {armor.maxDex === null ? "—" : armor.maxDex} / ACP {armor.armorCheckPenalty}
            </p>
          </div>
        </div>
      </section>

      <section className="wide-panel">
        <div className="skill-header">
          <div>
            <h2>Skills</h2>
            <p className="muted">
              클래스 스킬은 랭크가 1 이상이면 +3 보너스를 받습니다. 갑옷 체크 페널티는 해당 스킬에 자동 적용됩니다.
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
      </section>
    </main>
  );
}
