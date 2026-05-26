export const CLASS_FEATURE_CHOICES: Record<string, { id: string; label: string; options: { id: string; name: string; text: string }[] }[]> = {
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
