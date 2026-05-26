import type { Feat } from "../types";

export const FEATS: Feat[] = [
  { id: "none", name: "선택 안 함", type: "-", prereq: "-", benefit: "아직 선택하지 않은 슬롯입니다." },
  { id: "powerAttack", name: "Power Attack", type: "Combat", prereq: "Str 13, BAB +1", benefit: "근접 공격 명중을 낮추고 피해를 증가시킨다. 행동 탭에서 토글 가능." },
  { id: "weaponFinesse", name: "Weapon Finesse", type: "Combat", prereq: "-", benefit: "일부 가벼운 무기와 레이피어 등의 명중 굴림에 DEX를 사용할 수 있다." },
  { id: "toughness", name: "Toughness", type: "General", prereq: "-", benefit: "HP가 증가한다. 현재 프로토타입에서는 최소 +3, 이후 레벨에 따라 증가." },
  { id: "improvedInitiative", name: "Improved Initiative", type: "Combat", prereq: "-", benefit: "우선권에 +4 보너스." },
  { id: "combatCasting", name: "Combat Casting", type: "General", prereq: "-", benefit: "방어적 시전 및 그래플 중 시전 집중 판정에 +4." },
];
