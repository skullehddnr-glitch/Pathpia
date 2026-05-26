import { GENERATED_ARCHETYPES_BY_CLASS } from "./archetypes.generated";
export const MANUAL_ARCHETYPES_BY_CLASS: Record<
  string,
  { id: string; name: string; text: string }[]
> = {
  fighter: [
    {
      id: "none",
      name: "기본 파이터",
      text: "아키타입을 적용하지 않은 기본 파이터입니다.",
    },
    {
      id: "twoHandedFighter",
      name: "Two-Handed Fighter",
      text: "양손 무기 전투에 집중하는 파이터 아키타입 예시입니다.",
    },
    {
      id: "archer",
      name: "Archer",
      text: "활과 원거리 전투에 집중하는 파이터 아키타입 예시입니다.",
    },
  ],
  rogue: [
    {
      id: "none",
      name: "기본 로그",
      text: "아키타입을 적용하지 않은 기본 로그입니다.",
    },
    {
      id: "knifeMaster",
      name: "Knife Master",
      text: "단검과 기습 공격에 특화된 로그 아키타입 예시입니다.",
    },
    {
      id: "scout",
      name: "Scout",
      text: "이동과 기습을 강조하는 로그 아키타입 예시입니다.",
    },
  ],
  cleric: [
    {
      id: "none",
      name: "기본 클레릭",
      text: "아키타입을 적용하지 않은 기본 클레릭입니다.",
    },
    {
      id: "crusader",
      name: "Crusader",
      text: "전투적 성향을 강화한 클레릭 아키타입 예시입니다.",
    },
  ],
  wizard: [
    {
      id: "none",
      name: "기본 위저드",
      text: "아키타입을 적용하지 않은 기본 위저드입니다.",
    },
    {
      id: "scrollScholar",
      name: "Scroll Scholar",
      text: "스크롤과 지식 사용에 특화된 위저드 아키타입 예시입니다.",
    },
  ],
};

export const ARCHETYPES_BY_CLASS = {
  ...MANUAL_ARCHETYPES_BY_CLASS,
  ...GENERATED_ARCHETYPES_BY_CLASS,
};
