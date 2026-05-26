import type { Armor, Weapon } from "../types";

export const ARMORS: Armor[] = [
  { id: "none", name: "No Armor / 무갑옷", armorBonus: 0, shieldBonus: 0, maxDex: null, armorCheckPenalty: 0, description: "방어구 없음." },
  { id: "leather", name: "Leather Armor / 가죽 갑옷", armorBonus: 2, shieldBonus: 0, maxDex: 6, armorCheckPenalty: 0, description: "가벼운 갑옷." },
  { id: "chainShirt", name: "Chain Shirt / 체인 셔츠", armorBonus: 4, shieldBonus: 0, maxDex: 4, armorCheckPenalty: -2, description: "초반 전투 캐릭터에게 자주 쓰이는 가벼운 갑옷." },
  { id: "breastplate", name: "Breastplate / 브레스트플레이트", armorBonus: 6, shieldBonus: 0, maxDex: 3, armorCheckPenalty: -4, description: "중형 갑옷. AC는 높지만 스킬 페널티가 크다." },
  { id: "heavyShield", name: "Heavy Shield only / 헤비 실드만", armorBonus: 0, shieldBonus: 2, maxDex: null, armorCheckPenalty: -2, description: "방패만 장착한 상태." },
  { id: "chainAndShield", name: "Chain Shirt + Heavy Shield", armorBonus: 4, shieldBonus: 2, maxDex: 4, armorCheckPenalty: -4, description: "체인 셔츠와 헤비 실드를 함께 사용하는 데모 장비." },
];

export const WEAPONS: Weapon[] = [
  { id: "longsword", name: "Longsword / 롱소드", attackAbility: "str", damageAbility: "str", damage: "1d8", threat: "19-20", crit: "x2", enhancement: 0, melee: true, description: "표준적인 한손 근접 무기." },
  { id: "rapier", name: "Rapier / 레이피어", attackAbility: "str", damageAbility: "str", damage: "1d6", threat: "18-20", crit: "x2", enhancement: 0, melee: true, finesse: true, description: "Weapon Finesse가 있으면 명중에 DEX 사용 가능." },
  { id: "dagger", name: "Dagger / 대거", attackAbility: "str", damageAbility: "str", damage: "1d4", threat: "19-20", crit: "x2", enhancement: 0, melee: true, finesse: true, description: "가벼운 보조 무기." },
  { id: "shortbow", name: "Shortbow / 숏보우", attackAbility: "dex", damageAbility: null, damage: "1d6", threat: "20", crit: "x3", enhancement: 0, melee: false, description: "원거리 무기. 피해에 능력치 보정 없음으로 처리." },
];
