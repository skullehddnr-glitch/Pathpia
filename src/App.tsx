import { useMemo, useState } from "react";
import "./App.css";

import type { Ability, TabId, InventoryItem } from "./types";
import { RACES } from "./data/races";
import { CLASSES } from "./data/classes";
import { SKILLS } from "./data/skills";
import { ARMORS, WEAPONS } from "./data/equipment";
import { FEATS } from "./data/feats";
import { CLASS_FEATURE_CHOICES } from "./data/classFeatures";
import { SPELLS } from "./data/spells";
import {
  buildClassFeatureTimeline,
  buildFeatTimelineEntries,
  buildSpellSlotSummary,
} from "./lib/classAutomation";
import {
  getKnownSpellLimit,
  getSpellOptions,
  makeSpellKey,
} from "./lib/spellcasting";
import { ARCHETYPES_BY_CLASS } from "./data/archetypes";

import {
  abilityMod,
  signed,
  babValue,
  saveValue,
  powerAttackPenalty,
  getPointBuyCost,
  getTotalPointBuy,
  getLevelIncreaseSlots,
  countLevelIncreases,
  getTotalLevel,
} from "./lib/pf1eRules";

import {
  makeDefaultClassLevels,
  getClassLevelSummary,
  getStartingClass,
} from "./lib/leveling";

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"] as const;

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
  spells: "주문",
  inventory: "인벤토리",
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






function getFeatSlots(totalLevel: number, raceId: string, fighterLevel: number) {
  const slots: { id: string; label: string }[] = [];

  for (let current = 1; current <= totalLevel; current += 2) {
    slots.push({ id: "level-" + current, label: current + "레벨 일반 피트" });
  }

  if (raceId === "human") {
    slots.push({ id: "human-bonus", label: "인간 보너스 피트" });
  }

  for (let current = 1; current <= fighterLevel; current++) {
    if (current === 1 || current % 2 === 0) {
      slots.push({ id: "fighter-" + current, label: current + "레벨 파이터 보너스 피트" });
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
  const [startingClassId, setStartingClassId] = useState("fighter");
  const [classLevels, setClassLevels] = useState<Record<string, number>>(() => makeDefaultClassLevels());
  const [statIncreases, setStatIncreases] = useState<Record<number, Ability>>({});
  const [selectedArmorId, setSelectedArmorId] = useState("chainShirt");
  const [selectedWeaponId, setSelectedWeaponId] = useState("longsword");
  const [powerAttackOn, setPowerAttackOn] = useState(false);
  const [skillRanks, setSkillRanks] = useState<Record<string, number>>(() => makeDefaultSkillRanks());
  const [selectedFeats, setSelectedFeats] = useState<Record<string, string>>({});
  const [spellNotes, setSpellNotes] = useState<Record<string, string>>({});
  const [usedSpellSlots, setUsedSpellSlots] = useState<Record<string, number>>({});
  const [knownSpells, setKnownSpells] = useState<Record<string, string[]>>({});
  const [extraKnownSpells, setExtraKnownSpells] = useState<Record<string, number>>({});
  const [selectedArchetypes, setSelectedArchetypes] = useState<Record<string, string>>({});
  const [pendingClassId, setPendingClassId] = useState("rogue");
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
  const armor = ARMORS.find((item) => item.id === selectedArmorId) || ARMORS[0];
  const weapon = WEAPONS.find((item) => item.id === selectedWeaponId) || WEAPONS[0];
  const totalLevel = getTotalLevel(classLevels);
  const startingClass = getStartingClass(classLevels, startingClassId);
  const classSummary = getClassLevelSummary(classLevels);
  const levelIncreaseSlots = getLevelIncreaseSlots(totalLevel);
  const pointBuy = getTotalPointBuy(baseScores);
  const activeClasses = CLASSES.filter((classDef) => (classLevels[classDef.id] || 0) > 0);
  const inactiveClasses = CLASSES.filter((classDef) => (classLevels[classDef.id] || 0) === 0);

  const featSlots = getFeatSlots(totalLevel, raceId, classLevels.fighter || 0);
  const chosenFeatIds = Object.values(selectedFeats).filter((id) => id && id !== "none");
  const inventoryItems = buildInventoryItems(inventory);
  const classFeatureTimeline = buildClassFeatureTimeline(classLevels, startingClass.id);
  const featTimeline = buildFeatTimelineEntries(featSlots, selectedFeats, getFeatById);
  const progressionTimeline = [...classFeatureTimeline, ...featTimeline].sort(
    (a, b) =>
      a.sortLevel - b.sortLevel ||
      (a.kind === "feat" ? 1 : 0) - (b.kind === "feat" ? 1 : 0)
  );
  const spellSlotSummary = buildSpellSlotSummary(classLevels);

  const derived = useMemo(() => {
    const finalScores = { ...baseScores };

    const raceBonuses: Record<Ability, number> = {
      str: race.abilityBonuses.str || 0,
      dex: race.abilityBonuses.dex || 0,
      con: race.abilityBonuses.con || 0,
      int: race.abilityBonuses.int || 0,
      wis: race.abilityBonuses.wis || 0,
      cha: race.abilityBonuses.cha || 0,
    };

    const levelBonuses: Record<Ability, number> = {
      str: countLevelIncreases(statIncreases, "str"),
      dex: countLevelIncreases(statIncreases, "dex"),
      con: countLevelIncreases(statIncreases, "con"),
      int: countLevelIncreases(statIncreases, "int"),
      wis: countLevelIncreases(statIncreases, "wis"),
      cha: countLevelIncreases(statIncreases, "cha"),
    };

    for (const ability of ABILITIES) {
      finalScores[ability] += raceBonuses[ability] + levelBonuses[ability];
    }

    const mods: Record<Ability, number> = {
      str: abilityMod(finalScores.str),
      dex: abilityMod(finalScores.dex),
      con: abilityMod(finalScores.con),
      int: abilityMod(finalScores.int),
      wis: abilityMod(finalScores.wis),
      cha: abilityMod(finalScores.cha),
    };

    let bab = 0;
    let fortBase = 0;
    let refBase = 0;
    let willBase = 0;
    let hp = 0;
    let skillRanksFromClasses = 0;

    const classSkillSet = new Set<string>();

    for (const classDef of CLASSES) {
      const classLevel = classLevels[classDef.id] || 0;
      if (classLevel <= 0) continue;

      bab += babValue(classDef.bab, classLevel);
      fortBase += saveValue(classDef.saves.fort, classLevel);
      refBase += saveValue(classDef.saves.ref, classLevel);
      willBase += saveValue(classDef.saves.will, classLevel);

      for (const skillId of classDef.classSkills) {
        classSkillSet.add(skillId);
      }

      const averageHpPerLevel = Math.ceil(classDef.hitDie / 2) + mods.con;

      if (classDef.id === startingClass.id) {
        hp += classDef.hitDie + mods.con;
        hp += Math.max(0, classLevel - 1) * averageHpPerLevel;
      } else {
        hp += classLevel * averageHpPerLevel;
      }

      skillRanksFromClasses += classLevel * Math.max(1, classDef.skillRanks + mods.int);
    }

    const hasToughness = chosenFeatIds.includes("toughness");
    const hasImprovedInitiative = chosenFeatIds.includes("improvedInitiative");
    const hasWeaponFinesse = chosenFeatIds.includes("weaponFinesse");
    const hasPowerAttack = chosenFeatIds.includes("powerAttack");

    hp += hasToughness ? Math.max(3, totalLevel) : 0;

    const sizeAc = race.size === "Small" ? 1 : 0;
    const sizeAttack = race.size === "Small" ? 1 : 0;
    const sizeCmbCmd = race.size === "Small" ? -1 : 0;
    const sizeStealth = race.size === "Small" ? 4 : 0;

    const dexForAc = armor.maxDex === null ? mods.dex : Math.min(mods.dex, armor.maxDex);

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

    const fort = fortBase + mods.con;
    const ref = refBase + mods.dex;
    const will = willBase + mods.wis;

    const cmb = bab + mods.str + sizeCmbCmd;
    const cmd = 10 + bab + mods.str + mods.dex + sizeCmbCmd;

    const totalSkillRanks =
      skillRanksFromClasses + (race.id === "human" ? totalLevel : 0);

    const skillRows = SKILLS.map((skill) => {
      const ranks = skillRanks[skill.id] || 0;
      const isClassSkill = classSkillSet.has(skill.id);
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
      raceBonuses,
      levelBonuses,
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
      totalSkillRanks,
      spentSkillRanks,
      skillRows,
      hasPowerAttack,
      paPenalty,
      paDamage,
    };
  }, [
    baseScores,
    race,
    classLevels,
    startingClass,
    armor,
    weapon,
    totalLevel,
    skillRanks,
    chosenFeatIds.join(","),
    powerAttackOn,
    statIncreases,
  ]);

  function selectStartingClass(classId: string) {
    setStartingClassId(classId);

    setClassLevels((prev) => {
      const currentTotal = getTotalLevel(prev);
      const activeClassIds = Object.entries(prev)
        .filter(([, level]) => level > 0)
        .map(([id]) => id);

      if ((prev[classId] || 0) > 0) {
        return prev;
      }

      if (currentTotal === 1 && activeClassIds.length === 1) {
        const next: Record<string, number> = { ...prev };

        for (const key of Object.keys(next)) {
          next[key] = 0;
        }

        next[classId] = 1;
        return next;
      }

      if (currentTotal >= 20) {
        return prev;
      }

      return {
        ...prev,
        [classId]: 1,
      };
    });
  }

  function changeClassLevel(classId: string, delta: number) {
    setClassLevels((prev) => {
      const currentTotal = getTotalLevel(prev);
      const currentValue = prev[classId] || 0;

      if (delta > 0 && currentTotal >= 20) return prev;
      if (delta < 0 && currentValue <= 0) return prev;
      if (delta < 0 && currentTotal <= 1) return prev;

      return {
        ...prev,
        [classId]: Math.max(0, currentValue + delta),
      };
    });
  }

  function chooseStatIncrease(level: number, ability: Ability) {
    setStatIncreases((prev) => ({
      ...prev,
      [level]: ability,
    }));
  }

  function changeScore(ability: Ability, value: number) {
    setBaseScores((prev) => ({
      ...prev,
      [ability]: Math.max(7, Math.min(18, value || 7)),
    }));
  }

  function addPendingClass() {
    setClassLevels((prev) => {
      const currentTotal = getTotalLevel(prev);
      if (currentTotal >= 20) return prev;

      const target =
        CLASSES.find((classDef) => classDef.id === pendingClassId && (prev[classDef.id] || 0) === 0) ||
        CLASSES.find((classDef) => (prev[classDef.id] || 0) === 0);

      if (!target) return prev;

      return {
        ...prev,
        [target.id]: 1,
      };
    });
  }

  function changeArchetype(classId: string, archetypeId: string) {
    setSelectedArchetypes((prev) => ({
      ...prev,
      [classId]: archetypeId,
    }));
  }

  function changeSkillRank(skillId: string, value: number) {
    setSkillRanks((prev) => ({
      ...prev,
      [skillId]: Math.max(0, Math.min(totalLevel, value || 0)),
    }));
  }

  function adjustUsedSpellSlot(classId: string, spellLevel: number, delta: number, max: number) {
    const key = makeSpellKey(classId, spellLevel);

    setUsedSpellSlots((prev) => {
      const current = prev[key] || 0;
      const next = Math.max(0, Math.min(max, current + delta));

      return {
        ...prev,
        [key]: next,
      };
    });
  }

  function restoreClassSpellSlots(classId: string) {
    setUsedSpellSlots((prev) => {
      const next = { ...prev };

      for (const key of Object.keys(next)) {
        if (key.startsWith(classId + ":")) {
          next[key] = 0;
        }
      }

      return next;
    });
  }

  function addKnownSpell(classId: string, spellLevel: number, spellId: string, maxKnown: number | null) {
    if (!spellId) return;

    const key = makeSpellKey(classId, spellLevel);

    setKnownSpells((prev) => {
      const current = prev[key] || [];

      if (current.includes(spellId)) {
        return prev;
      }

      if (maxKnown !== null && current.length >= maxKnown) {
        return prev;
      }

      return {
        ...prev,
        [key]: [...current, spellId],
      };
    });
  }

  function removeKnownSpell(classId: string, spellLevel: number, spellId: string) {
    const key = makeSpellKey(classId, spellLevel);

    setKnownSpells((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((id) => id !== spellId),
    }));
  }

  function addExtraKnownSpell(classId: string, spellLevel: number) {
    const key = makeSpellKey(classId, spellLevel);

    setExtraKnownSpells((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
  }

  function changeSpellNote(classId: string, value: string) {
    setSpellNotes((prev) => ({
      ...prev,
      [classId]: value,
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
            {name} / {classSummary} / 총 {totalLevel}레벨
          </p>
        </div>
      </section>

      <nav className="tabs">
        {(["basic", "skills", "actions", "feats", "spells", "inventory"] as TabId[]).map((tab) => (
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

              <label>Race</label>
              <select value={raceId} onChange={(e) => setRaceId(e.target.value)}>
                {RACES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <div className="class-manager compact-class-manager">
                <div className="class-manager-head">
                  <h3>클래스와 레벨</h3>
                  <strong>총 {totalLevel}레벨</strong>
                </div>

                <label>시작 클래스</label>
                <select
                  value={startingClass.id}
                  onChange={(e) => selectStartingClass(e.target.value)}
                >
                  {CLASSES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <div className="active-class-list">
                  {activeClasses.map((classDef) => {
                    const classLevel = classLevels[classDef.id] || 0;
                    const archetypes = ARCHETYPES_BY_CLASS[classDef.id] || [
                      { id: "none", name: "기본", text: "아키타입 없음" },
                    ];
                    const selectedArchetypeId = selectedArchetypes[classDef.id] || "none";
                    const selectedArchetype =
                      archetypes.find((item) => item.id === selectedArchetypeId) || archetypes[0];

                    return (
                      <div className="class-row class-row-compact" key={classDef.id}>
                        <div className="class-main-line">
                          <div>
                            <strong>{classDef.name}</strong>
                            <p>HD d{classDef.hitDie} / BAB {classDef.bab}</p>
                          </div>

                          <div className="level-controls">
                            <button onClick={() => changeClassLevel(classDef.id, -1)}>-</button>
                            <span>{classLevel}</span>
                            <button onClick={() => changeClassLevel(classDef.id, 1)}>+</button>
                          </div>
                        </div>

                        <div className="archetype-row">
                          <span>아키타입</span>
                          <select
                            value={selectedArchetypeId}
                            onChange={(e) => changeArchetype(classDef.id, e.target.value)}
                          >
                            {archetypes.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="archetype-help">{selectedArchetype.text}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="add-class-row">
                  <select
                    value={inactiveClasses.some((item) => item.id === pendingClassId) ? pendingClassId : inactiveClasses[0]?.id || ""}
                    onChange={(e) => setPendingClassId(e.target.value)}
                    disabled={inactiveClasses.length === 0 || totalLevel >= 20}
                  >
                    {inactiveClasses.length === 0 && <option value="">추가 가능한 클래스 없음</option>}
                    {inactiveClasses.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addPendingClass}
                    disabled={inactiveClasses.length === 0 || totalLevel >= 20}
                  >
                    새 클래스 추가
                  </button>
                </div>
              </div>

              <div className="score-summary">
                <div>
                  <span>Point Buy</span>
                  <strong className={pointBuy.valid ? "" : "warning-text"}>
                    {pointBuy.valid ? pointBuy.total + "점" : "범위 밖"}
                  </strong>
                </div>
                <p>
                  포인트바이는 종족 보너스와 레벨 상승을 제외한 초기 능력치 기준입니다.
                </p>
              </div>

              <div className="ability-grid ability-grid-wide">
                {ABILITIES.map((ability) => {
                  const base = baseScores[ability];
                  const raceBonus = derived.raceBonuses[ability];
                  const levelBonus = derived.levelBonuses[ability];
                  const cost = getPointBuyCost(base);

                  return (
                    <div className="ability" key={ability}>
                      <div className="ability-header">
                        <strong>{abilityNames[ability]}</strong>
                        <span>{signed(derived.mods[ability])}</span>
                      </div>

                      <div className="score-stepper">
                        <button onClick={() => changeScore(ability, base - 1)}>-</button>
                        <strong>{base}</strong>
                        <button onClick={() => changeScore(ability, base + 1)}>+</button>
                      </div>

                      <div className="score-breakdown">
                        <div>
                          <span>기본</span>
                          <strong>{base}</strong>
                        </div>
                        <div>
                          <span>비용</span>
                          <strong>{cost === null ? "—" : cost}</strong>
                        </div>
                        <div>
                          <span>종족</span>
                          <strong>{signed(raceBonus)}</strong>
                        </div>
                        <div>
                          <span>레벨</span>
                          <strong>{signed(levelBonus)}</strong>
                        </div>
                        <div>
                          <span>최종</span>
                          <strong>{derived.finalScores[ability]}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="level-increase-panel">
                <h3>레벨별 능력치 상승</h3>
                {levelIncreaseSlots.length === 0 && (
                  <p className="muted">4레벨부터 능력치 상승을 선택할 수 있습니다.</p>
                )}

                {levelIncreaseSlots.map((slotLevel) => (
                  <div className="increase-row" key={slotLevel}>
                    <strong>{slotLevel}레벨</strong>
                    <div className="increase-buttons">
                      {ABILITIES.map((ability) => (
                        <button
                          key={ability}
                          className={statIncreases[slotLevel] === ability ? "mini-button selected" : "mini-button"}
                          onClick={() => chooseStatIncrease(slotLevel, ability)}
                        >
                          {abilityNames[ability]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <h2>방어와 주요 수치</h2>

              <div className="defense-dashboard">
                <div className="defense-main defense-hp">
                  <span>HP</span>
                  <strong>{derived.hp}</strong>
                </div>

                <div className="defense-group defense-saves">
                  <div className="defense-group-title">내성굴림</div>
                  <div className="defense-mini-row three">
                    <MiniStat label="Fort" value={signed(derived.fort)} />
                    <MiniStat label="Ref" value={signed(derived.ref)} />
                    <MiniStat label="Will" value={signed(derived.will)} />
                  </div>
                </div>

                <div className="defense-main defense-ac">
                  <span>AC</span>
                  <strong>{derived.ac}</strong>
                </div>

                <div className="defense-group defense-special-ac">
                  <div className="defense-group-title">특수 AC</div>
                  <div className="defense-mini-row two">
                    <MiniStat label="Touch" value={String(derived.touchAc)} />
                    <MiniStat label="Flat" value={String(derived.flatFootedAc)} />
                  </div>
                </div>

                <div className="defense-group defense-combat">
                  <div className="defense-group-title">전투 수치</div>
                  <div className="defense-mini-row four">
                    <MiniStat label="BAB" value={signed(derived.bab)} />
                    <MiniStat label="Init" value={signed(derived.initiative)} />
                    <MiniStat label="CMB" value={signed(derived.cmb)} />
                    <MiniStat label="CMD" value={String(derived.cmd)} />
                  </div>
                </div>
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
                {activeClasses.map((classDef) => (
                  <div key={classDef.id} className="feature-group">
                    <strong>{classDef.name} {classLevels[classDef.id]}</strong>
                    <div className="tag-list">
                      {classDef.features.map((feature) => (
                        <span key={feature}>{feature}</span>
                      ))}
                    </div>
                  </div>
                ))}
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
                    max={totalLevel}
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
          <div className="wide-panel progression-panel">
            <div className="progression-head">
              <div>
                <h2>획득 순서</h2>
                <p className="muted">
                  피트와 클래스 피처를 레벨 순서대로 표시합니다. 멀티클래스 순서는 현재 클래스 레벨 합계에서 추정합니다.
                </p>
              </div>
            </div>

            <div className="progression-list">
              {progressionTimeline.map((entry, index) => (
                <div
                  key={entry.kind + "-" + entry.displayLevel + "-" + entry.name + "-" + index}
                  className={entry.kind === "feat" ? "progression-row feat-entry" : "progression-row feature-entry"}
                >
                  <div className="progression-level">{entry.displayLevel}</div>
                  <div>
                    <div className="progression-title">
                      <span>{entry.kind === "feat" ? "피트" : "클래스 피처"}</span>
                      <strong>{entry.name}</strong>
                    </div>
                    <p>{entry.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

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

              {activeClasses.map((classDef) => {
                const groups = CLASS_FEATURE_CHOICES[classDef.id] || [];

                return (
                  <div key={classDef.id} className="choice-block">
                    <h3>{classDef.name} {classLevels[classDef.id]}</h3>

                    {groups.length === 0 && (
                      <p className="muted">현재 클래스에는 선택형 피처 예시가 없습니다.</p>
                    )}

                    {groups.map((group) => {
                      const choiceKey = classDef.id + ":" + group.id;
                      const selectedOptionId = classChoices[choiceKey] || group.options[0].id;
                      const selectedOption =
                        group.options.find((option) => option.id === selectedOptionId) || group.options[0];

                      return (
                        <div key={choiceKey}>
                          <label>{group.label}</label>
                          <select
                            value={selectedOptionId}
                            onChange={(e) => changeClassChoice(choiceKey, e.target.value)}
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
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
      {activeTab === "spells" && (
        <section className="tab-panel">
          <div className="wide-panel spells-page">
            <div className="spells-head">
              <div>
                <h2>주문</h2>
                <p className="muted">
                  주문 슬롯을 소모/회복하고, 클래스와 주문 레벨별로 알고 있는 주문을 관리합니다.
                  준비형 시전자는 알고 있는 주문 제한을 두지 않고, 즉흥형 시전자는 자동화된 기본 한도를 적용합니다.
                </p>
              </div>
            </div>

            {spellSlotSummary.length === 0 && (
              <div className="empty-spell-state">
                <h3>주문 시전 클래스가 없습니다</h3>
                <p className="muted">
                  위저드, 클레릭, 드루이드, 바드, 소서러 같은 주문 시전 클래스를 추가하면 이곳에 주문 슬롯이 표시됩니다.
                </p>
              </div>
            )}

            <div className="spell-class-list">
              {spellSlotSummary.map((row) => (
                <div className="spell-class-card" key={row.classId}>
                  <div className="spell-class-header">
                    <div>
                      <h3>{row.className} {row.classLevel}</h3>
                      <p className="muted">
                        {row.tradition} / key ability {row.ability}
                      </p>
                    </div>

                    <button
                      className="restore-slots-button"
                      onClick={() => restoreClassSpellSlots(row.classId)}
                    >
                      슬롯 전체 회복
                    </button>
                  </div>

                  <div className="slot-control-grid">
                    {row.slots.map((maxSlots, spellLevel) => {
                      const slotKey = makeSpellKey(row.classId, spellLevel);
                      const used = usedSpellSlots[slotKey] || 0;
                      const current = Math.max(0, maxSlots - used);

                      return (
                        <div className="slot-control-card" key={spellLevel}>
                          <div className="slot-control-head">
                            <span>{spellLevel}레벨</span>
                            <strong>{current} / {maxSlots}</strong>
                          </div>

                          <div className="slot-buttons">
                            <button onClick={() => adjustUsedSpellSlot(row.classId, spellLevel, 1, maxSlots)}>
                              소모
                            </button>
                            <button onClick={() => adjustUsedSpellSlot(row.classId, spellLevel, -1, maxSlots)}>
                              회복
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {row.note && <p className="slot-note">{row.note}</p>}

                  <div className="known-spell-sections">
                    {row.slots.map((_maxSlots, spellLevel) => {
                      const key = makeSpellKey(row.classId, spellLevel);
                      const selectedIds = knownSpells[key] || [];
                      const options = getSpellOptions(SPELLS, row.classId, spellLevel);
                      const selected = selectedIds
                        .map((id) => SPELLS.find((spell) => spell.id === id))
                        .filter(Boolean);
                      const baseLimit = getKnownSpellLimit(row.classId, row.classLevel, spellLevel);
                      const extra = extraKnownSpells[key] || 0;
                      const maxKnown = baseLimit === null ? null : baseLimit + extra;
                      const remainingOptions = options.filter((spell) => !selectedIds.includes(spell.id));
                      const canAddMore = maxKnown === null || selectedIds.length < maxKnown;

                      return (
                        <div className="known-spell-level" key={spellLevel}>
                          <div className="known-spell-head">
                            <strong>{spellLevel}레벨 주문</strong>
                            <span>
                              알고 있음 {selectedIds.length} / {maxKnown === null ? "제한 없음" : maxKnown}
                            </span>
                          </div>

                          <div className="known-spell-add-row">
                            <select
                              value=""
                              onChange={(e) => {
                                addKnownSpell(row.classId, spellLevel, e.target.value, maxKnown);
                                e.currentTarget.value = "";
                              }}
                              disabled={!canAddMore || remainingOptions.length === 0}
                            >
                              <option value="">
                                {remainingOptions.length === 0
                                  ? "추가 가능한 주문 없음"
                                  : "주문 선택"}
                              </option>
                              {remainingOptions.map((spell) => (
                                <option key={spell.id} value={spell.id}>
                                  {spell.name}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => addExtraKnownSpell(row.classId, spellLevel)}
                              disabled={baseLimit === null}
                            >
                              추가 주문 +1
                            </button>
                          </div>

                          <div className="known-spell-list">
                            {selected.length === 0 && (
                              <p className="muted">선택한 주문이 없습니다.</p>
                            )}

                            {selected.map((spell) => (
                              <div className="known-spell-pill" key={spell!.id}>
                                <div>
                                  <strong>{spell!.name}</strong>
                                  <p>{spell!.summary}</p>
                                </div>
                                <button onClick={() => removeKnownSpell(row.classId, spellLevel, spell!.id)}>
                                  제거
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <label>주문 준비 / 운용 메모</label>
                  <textarea
                    className="spell-note"
                    value={spellNotes[row.classId] || ""}
                    onChange={(e) => changeSpellNote(row.classId, e.target.value)}
                    placeholder={"예: 오늘 준비한 주문, 자주 쓰는 주문 조합, 주문책 메모"}
                  />
                </div>
              ))}
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


function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="vital-mini">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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
