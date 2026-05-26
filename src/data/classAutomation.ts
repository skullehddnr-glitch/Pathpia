export type FeatureEntry = {
  level: number;
  name: string;
  text: string;
};

export type SpellcastingProfileId =
  | "none"
  | "full9Prepared"
  | "full9Spontaneous"
  | "sixPrepared"
  | "sixSpontaneous"
  | "fourPrepared"
  | "alchemistExtracts"
  | "summoner6"
  | "unchainedSummoner6";

export type ClassAutomation = {
  features: FeatureEntry[];
  spellcasting?: {
    profileId: SpellcastingProfileId;
    ability: "int" | "wis" | "cha" | "con";
    tradition: "prepared" | "spontaneous" | "extracts" | "psychic" | "none";
    note?: string;
  };
};

function f(level: number, name: string, text: string): FeatureEntry {
  return { level, name, text };
}

function everyEven(name: string, text: string, maxLevel = 20): FeatureEntry[] {
  const result: FeatureEntry[] = [];
  for (let level = 2; level <= maxLevel; level += 2) {
    result.push(f(level, name, text));
  }
  return result;
}

function everyOddFrom3(name: string, text: string, maxLevel = 19): FeatureEntry[] {
  const result: FeatureEntry[] = [];
  for (let level = 3; level <= maxLevel; level += 2) {
    result.push(f(level, name, text));
  }
  return result;
}

function everyThreeFrom2(name: string, text: string, maxLevel = 20): FeatureEntry[] {
  const result: FeatureEntry[] = [];
  for (let level = 2; level <= maxLevel; level += 3) {
    result.push(f(level, name, text));
  }
  return result;
}

const casterNote =
  "표시 슬롯은 기본 슬롯 요약입니다. 능력치 보너스 슬롯, 도메인/학파/혈통/아키타입 보정은 아직 별도 계산하지 않습니다.";

export const CLASS_AUTOMATION: Record<string, ClassAutomation> = {
  barbarian: {
    features: [
      f(1, "Rage", "분노를 사용합니다."),
      f(1, "Fast Movement", "기본 이동속도가 증가합니다."),
      f(2, "Rage Power", "분노 능력을 하나 얻습니다."),
      ...everyEven("Rage Power", "추가 분노 능력을 얻습니다."),
      f(2, "Uncanny Dodge", "기습 상황에 대한 방어 능력을 얻습니다."),
      f(5, "Improved Uncanny Dodge", "향상된 uncanny dodge를 얻습니다."),
      f(11, "Greater Rage", "분노가 강화됩니다."),
      f(17, "Tireless Rage", "분노 후 피로해지지 않습니다."),
      f(20, "Mighty Rage", "최종 분노 강화."),
    ],
  },

  bard: {
    features: [
      f(1, "Bardic Performance", "바드 공연을 사용할 수 있습니다."),
      f(1, "Bardic Knowledge", "지식 판정에 보너스를 얻습니다."),
      f(2, "Well-Versed", "공연/음파/언어 효과에 강해집니다."),
      f(5, "Lore Master", "지식 판정 관련 능력을 얻습니다."),
      f(10, "Jack-of-All-Trades", "기술 사용 범위가 넓어집니다."),
    ],
    spellcasting: {
      profileId: "sixSpontaneous",
      ability: "cha",
      tradition: "spontaneous",
      note: casterNote,
    },
  },

  cleric: {
    features: [
      f(1, "Aura", "신앙 성향 오라를 가집니다."),
      f(1, "Channel Energy", "에너지 방출을 얻습니다."),
      f(1, "Domains", "도메인 능력을 얻습니다."),
      f(1, "Orisons", "0레벨 주문을 사용할 수 있습니다."),
      f(1, "Spontaneous Casting", "준비 주문을 치료/상해 주문으로 전환할 수 있습니다."),
    ],
    spellcasting: {
      profileId: "full9Prepared",
      ability: "wis",
      tradition: "prepared",
      note: casterNote,
    },
  },

  druid: {
    features: [
      f(1, "Nature Bond", "동물 동료 또는 자연 도메인을 선택합니다."),
      f(1, "Nature Sense", "자연 관련 판정에 보너스."),
      f(1, "Wild Empathy", "동물과 교감합니다."),
      f(2, "Woodland Stride", "자연 지형 이동 능력."),
      f(4, "Wild Shape", "야생 변신을 얻습니다."),
      f(13, "A Thousand Faces", "외형 변화 능력."),
      f(15, "Timeless Body", "노화 영향 감소."),
    ],
    spellcasting: {
      profileId: "full9Prepared",
      ability: "wis",
      tradition: "prepared",
      note: casterNote,
    },
  },

  fighter: {
    features: [
      f(1, "Bonus Combat Feat", "전투 피트를 보너스로 얻습니다."),
      ...everyEven("Bonus Combat Feat", "전투 피트를 보너스로 얻습니다."),
      f(2, "Bravery", "공포 내성 보너스."),
      f(3, "Armor Training", "갑옷 운용 능력이 향상됩니다."),
      f(5, "Weapon Training", "무기군 하나를 선택해 보너스를 얻습니다."),
      f(7, "Armor Training", "갑옷 운용 능력이 향상됩니다."),
      f(9, "Weapon Training", "무기 훈련이 향상됩니다."),
      f(11, "Armor Training", "갑옷 운용 능력이 향상됩니다."),
      f(13, "Weapon Training", "무기 훈련이 향상됩니다."),
      f(15, "Armor Training", "갑옷 운용 능력이 향상됩니다."),
      f(17, "Weapon Training", "무기 훈련이 향상됩니다."),
      f(19, "Armor Mastery", "갑옷 숙련 최종 강화."),
      f(20, "Weapon Mastery", "선택 무기군 최종 강화."),
    ],
  },

  monk: {
    features: [
      f(1, "Flurry of Blows", "연타 공격을 사용합니다."),
      f(1, "Bonus Feat", "몽크 보너스 피트."),
      f(1, "Stunning Fist", "기절의 일격."),
      f(2, "Evasion", "회피 능력."),
      f(3, "Maneuver Training", "전투기동 계산 보정."),
      f(4, "Ki Pool", "기 포인트를 얻습니다."),
      f(5, "High Jump", "도약 능력 향상."),
      f(7, "Wholeness of Body", "자기 치유 능력."),
      f(11, "Diamond Body", "독 면역."),
      f(13, "Diamond Soul", "주문 저항."),
      f(20, "Perfect Self", "최종 변성."),
    ],
  },

  paladin: {
    features: [
      f(1, "Aura of Good", "선 성향 오라."),
      f(1, "Detect Evil", "악 탐지."),
      f(1, "Smite Evil", "악 성향 적을 강타."),
      f(2, "Divine Grace", "내성굴림에 CHA 보너스."),
      f(2, "Lay on Hands", "치유의 손길."),
      f(3, "Aura of Courage", "공포 면역 오라."),
      f(4, "Channel Positive Energy", "양에너지 방출."),
      f(5, "Divine Bond", "무기 또는 탈것 결속."),
      f(20, "Holy Champion", "최종 강화."),
    ],
    spellcasting: {
      profileId: "fourPrepared",
      ability: "wis",
      tradition: "prepared",
      note: casterNote,
    },
  },

  ranger: {
    features: [
      f(1, "Favored Enemy", "선호 적을 선택합니다."),
      f(1, "Track", "추적 보너스."),
      f(1, "Wild Empathy", "동물 교감."),
      f(2, "Combat Style Feat", "전투 스타일 피트."),
      ...everyThreeFrom2("Combat Style Feat", "전투 스타일 피트를 추가로 얻습니다."),
      f(3, "Favored Terrain", "선호 지형."),
      f(4, "Hunter's Bond", "동료 또는 동물 동료 결속."),
      f(7, "Woodland Stride", "자연 지형 이동 능력."),
      f(8, "Swift Tracker", "빠른 추적."),
      f(11, "Quarry", "사냥감 지정."),
      f(19, "Improved Quarry", "향상된 사냥감 지정."),
      f(20, "Master Hunter", "최종 사냥꾼 능력."),
    ],
    spellcasting: {
      profileId: "fourPrepared",
      ability: "wis",
      tradition: "prepared",
      note: casterNote,
    },
  },

  rogue: {
    features: [
      f(1, "Sneak Attack", "조건을 만족하면 추가 피해."),
      f(1, "Trapfinding", "함정 탐지와 해제 보너스."),
      f(2, "Evasion", "회피 능력."),
      f(2, "Rogue Talent", "로그 재능."),
      ...everyEven("Rogue Talent", "로그 재능을 추가로 얻습니다."),
      f(3, "Trap Sense", "함정에 대한 감각."),
      f(4, "Uncanny Dodge", "기습 상황에 대한 방어 능력."),
      f(8, "Improved Uncanny Dodge", "향상된 uncanny dodge."),
      f(10, "Advanced Talents", "상급 로그 재능 접근."),
      f(20, "Master Strike", "최종 기습 능력."),
    ],
  },

  sorcerer: {
    features: [
      f(1, "Bloodline", "혈통을 선택합니다."),
      f(1, "Bloodline Arcana", "혈통 비전 능력."),
      f(1, "Cantrips", "0레벨 주문 사용."),
      f(1, "Eschew Materials", "재료 생략 피트."),
      ...everyOddFrom3("Bloodline Power", "혈통 능력이 강화됩니다."),
    ],
    spellcasting: {
      profileId: "full9Spontaneous",
      ability: "cha",
      tradition: "spontaneous",
      note: casterNote,
    },
  },

  wizard: {
    features: [
      f(1, "Arcane Bond", "비전 결속."),
      f(1, "Arcane School", "비전 학파."),
      f(1, "Cantrips", "0레벨 주문 사용."),
      f(1, "Scribe Scroll", "스크롤 제작 피트."),
      f(5, "Bonus Feat", "위저드 보너스 피트."),
      f(10, "Bonus Feat", "위저드 보너스 피트."),
      f(15, "Bonus Feat", "위저드 보너스 피트."),
      f(20, "Bonus Feat", "위저드 보너스 피트."),
    ],
    spellcasting: {
      profileId: "full9Prepared",
      ability: "int",
      tradition: "prepared",
      note: casterNote,
    },
  },

  alchemist: {
    features: [
      f(1, "Alchemy", "추출물, 폭탄, 변이약을 사용합니다."),
      f(1, "Bomb", "폭탄을 사용합니다."),
      f(1, "Brew Potion", "물약 제작 피트."),
      f(1, "Mutagen", "변이약 사용."),
      f(2, "Discovery", "디스커버리."),
      ...everyEven("Discovery", "디스커버리를 추가로 얻습니다."),
      f(20, "Grand Discovery", "최종 디스커버리."),
    ],
    spellcasting: {
      profileId: "alchemistExtracts",
      ability: "int",
      tradition: "extracts",
      note: "추출물 슬롯입니다. 보너스 추출물은 아직 계산하지 않습니다.",
    },
  },

  antipaladin: {
    features: [
      f(1, "Aura of Evil", "악 성향 오라."),
      f(1, "Detect Good", "선 탐지."),
      f(1, "Smite Good", "선 성향 적을 강타."),
      f(2, "Touch of Corruption", "부패의 손길."),
      f(3, "Aura of Cowardice", "공포 약화 오라."),
      f(5, "Fiendish Boon", "악마적 결속."),
      f(20, "Unholy Champion", "최종 강화."),
    ],
    spellcasting: {
      profileId: "fourPrepared",
      ability: "wis",
      tradition: "prepared",
      note: casterNote,
    },
  },

  cavalier: {
    features: [
      f(1, "Challenge", "도전 능력."),
      f(1, "Mount", "탈것."),
      f(1, "Order", "기사단 선택."),
      f(1, "Tactician", "전술 피트 공유."),
      f(3, "Cavalier's Charge", "돌격 강화."),
      f(4, "Expert Trainer", "탈것 훈련 강화."),
      f(5, "Banner", "깃발 능력."),
      f(20, "Supreme Charge", "최종 돌격 강화."),
    ],
  },

  gunslinger: {
    features: [
      f(1, "Grit", "그릿 포인트."),
      f(1, "Deeds", "총잡이 재주."),
      f(1, "Gunsmith", "총기 제작/관리."),
      f(2, "Nimble", "AC 보너스."),
      f(5, "Gun Training", "총기 훈련."),
      f(20, "True Grit", "최종 그릿 능력."),
    ],
  },

  inquisitor: {
    features: [
      f(1, "Judgment", "심판 능력."),
      f(1, "Monster Lore", "괴물 지식."),
      f(1, "Stern Gaze", "위협/동기파악 보너스."),
      f(2, "Cunning Initiative", "우선권 보정."),
      f(3, "Solo Tactics", "팀워크 피트 단독 사용."),
      f(5, "Bane", "무기 강화 능력."),
      f(20, "True Judgment", "최종 심판."),
    ],
    spellcasting: {
      profileId: "sixSpontaneous",
      ability: "wis",
      tradition: "spontaneous",
      note: casterNote,
    },
  },

  magus: {
    features: [
      f(1, "Arcane Pool", "비전 풀."),
      f(1, "Spell Combat", "무기 공격과 주문을 결합."),
      f(2, "Spellstrike", "접촉 주문을 무기 공격으로 전달."),
      f(3, "Magus Arcana", "메이거스 아르카나."),
      ...everyThreeFrom2("Magus Arcana", "메이거스 아르카나를 추가로 얻습니다."),
      f(20, "True Magus", "최종 메이거스 능력."),
    ],
    spellcasting: {
      profileId: "sixPrepared",
      ability: "int",
      tradition: "prepared",
      note: casterNote,
    },
  },

  oracle: {
    features: [
      f(1, "Mystery", "미스터리 선택."),
      f(1, "Oracle Curse", "오라클 저주."),
      f(1, "Revelation", "계시 능력."),
      f(3, "Revelation", "계시 능력 추가."),
      f(7, "Revelation", "계시 능력 추가."),
      f(11, "Revelation", "계시 능력 추가."),
      f(15, "Revelation", "계시 능력 추가."),
      f(19, "Final Revelation", "최종 계시."),
    ],
    spellcasting: {
      profileId: "full9Spontaneous",
      ability: "cha",
      tradition: "spontaneous",
      note: casterNote,
    },
  },

  summoner: {
    features: [
      f(1, "Eidolon", "아이돌론."),
      f(1, "Summon Monster", "소환 능력."),
      f(1, "Life Link", "아이돌론과 생명 연결."),
      f(2, "Bond Senses", "감각 공유."),
      f(4, "Shield Ally", "동료 보호."),
      f(20, "Twin Eidolon", "최종 아이돌론 능력."),
    ],
    spellcasting: {
      profileId: "summoner6",
      ability: "cha",
      tradition: "spontaneous",
      note: casterNote,
    },
  },

  witch: {
    features: [
      f(1, "Patron", "후원자 선택."),
      f(1, "Familiar", "패밀리어."),
      f(1, "Hex", "헥스."),
      f(2, "Hex", "헥스 추가."),
      ...everyEven("Hex", "헥스를 추가로 얻습니다."),
      f(10, "Major Hex", "상급 헥스 접근."),
      f(18, "Grand Hex", "최상급 헥스 접근."),
    ],
    spellcasting: {
      profileId: "full9Prepared",
      ability: "int",
      tradition: "prepared",
      note: casterNote,
    },
  },

  arcanist: {
    features: [
      f(1, "Arcane Reservoir", "비전 저장소."),
      f(1, "Arcanist Exploit", "아카니스트 익스플로잇."),
      f(3, "Arcanist Exploit", "익스플로잇 추가."),
      ...everyOddFrom3("Arcanist Exploit", "익스플로잇을 추가로 얻습니다."),
      f(20, "Magical Supremacy", "최종 아카니스트 능력."),
    ],
    spellcasting: {
      profileId: "full9Prepared",
      ability: "int",
      tradition: "prepared",
      note: "준비 후 즉흥 시전에 가까운 아카니스트 방식입니다. 현재는 9레벨 준비형 슬롯표로 표시합니다.",
    },
  },

  bloodrager: {
    features: [
      f(1, "Bloodrage", "혈분노."),
      f(1, "Bloodline", "혈통."),
      f(1, "Fast Movement", "이동속도 증가."),
      f(4, "Blood Casting", "분노 중 주문 시전."),
      f(4, "Eschew Materials", "재료 생략."),
      f(11, "Greater Bloodrage", "혈분노 강화."),
      f(20, "Mighty Bloodrage", "최종 혈분노 강화."),
    ],
    spellcasting: {
      profileId: "fourPrepared",
      ability: "cha",
      tradition: "spontaneous",
      note: "Bloodrager는 제한적인 4레벨 주문 시전자입니다. 현재는 4레벨 슬롯표로 표시합니다.",
    },
  },

  brawler: {
    features: [
      f(1, "Martial Flexibility", "임시 전투 피트 획득."),
      f(1, "Martial Training", "전투 피트 조건 계산 보조."),
      f(2, "Brawler's Flurry", "연속 공격."),
      f(3, "Maneuver Training", "전투기동 강화."),
      f(5, "Close Weapon Mastery", "근접 무기 피해 강화."),
      f(20, "Improved Awesome Blow", "최종 전투기동 능력."),
    ],
  },

  hunter: {
    features: [
      f(1, "Animal Companion", "동물 동료."),
      f(1, "Animal Focus", "동물적 능력 초점."),
      f(1, "Nature Training", "드루이드/레인저 관련 조건 계산."),
      f(2, "Precise Companion", "동물 동료와 협공 강화."),
      f(3, "Teamwork Feat", "팀워크 피트."),
      f(20, "Master Hunter", "최종 사냥꾼 능력."),
    ],
    spellcasting: {
      profileId: "sixPrepared",
      ability: "wis",
      tradition: "spontaneous",
      note: casterNote,
    },
  },

  investigator: {
    features: [
      f(1, "Alchemy", "추출물 사용."),
      f(1, "Inspiration", "영감 주사위."),
      f(1, "Trapfinding", "함정 해제 보너스."),
      f(3, "Investigator Talent", "인베스티게이터 재능."),
      ...everyOddFrom3("Investigator Talent", "재능을 추가로 얻습니다."),
      f(20, "True Inspiration", "최종 영감 능력."),
    ],
    spellcasting: {
      profileId: "alchemistExtracts",
      ability: "int",
      tradition: "extracts",
      note: "추출물 슬롯입니다. 보너스 추출물은 아직 계산하지 않습니다.",
    },
  },

  shaman: {
    features: [
      f(1, "Spirit", "영혼 선택."),
      f(1, "Spirit Animal", "영혼 동물."),
      f(2, "Hex", "헥스."),
      ...everyEven("Hex", "헥스를 추가로 얻습니다."),
      f(20, "Manifestation", "최종 영혼 발현."),
    ],
    spellcasting: {
      profileId: "full9Prepared",
      ability: "wis",
      tradition: "prepared",
      note: casterNote,
    },
  },

  skald: {
    features: [
      f(1, "Raging Song", "분노의 노래."),
      f(1, "Bardic Knowledge", "지식 판정 보너스."),
      f(3, "Rage Power", "분노 능력."),
      ...everyThreeFrom2("Rage Power", "분노 능력을 추가로 얻습니다."),
      f(20, "Master Skald", "최종 스칼드 능력."),
    ],
    spellcasting: {
      profileId: "sixSpontaneous",
      ability: "cha",
      tradition: "spontaneous",
      note: casterNote,
    },
  },

  slayer: {
    features: [
      f(1, "Studied Target", "표적 연구."),
      f(1, "Track", "추적 보너스."),
      f(2, "Slayer Talent", "슬레이어 재능."),
      ...everyEven("Slayer Talent", "슬레이어 재능을 추가로 얻습니다."),
      f(3, "Sneak Attack", "기습 공격."),
      f(20, "Master Slayer", "최종 슬레이어 능력."),
    ],
  },

  swashbuckler: {
    features: [
      f(1, "Panache", "파나슈 포인트."),
      f(1, "Deeds", "스워시버클러 재주."),
      f(1, "Opportune Parry and Riposte", "반격 재주."),
      f(1, "Swashbuckler Finesse", "민첩 기반 공격 보조."),
      f(5, "Swashbuckler Weapon Training", "무기 훈련."),
      f(20, "Swashbuckler Weapon Mastery", "최종 무기 숙련."),
    ],
  },

  warpriest: {
    features: [
      f(1, "Aura", "신앙 오라."),
      f(1, "Blessings", "축복 선택."),
      f(1, "Focus Weapon", "집중 무기."),
      f(2, "Fervor", "열정 능력."),
      f(4, "Channel Energy", "에너지 방출."),
      f(20, "Aspect of War", "전쟁의 화신."),
    ],
    spellcasting: {
      profileId: "sixPrepared",
      ability: "wis",
      tradition: "prepared",
      note: casterNote,
    },
  },

  psychic: {
    features: [
      f(1, "Psychic Discipline", "사이킥 학파."),
      f(1, "Phrenic Pool", "프레닉 풀."),
      f(1, "Phrenic Amplification", "증폭 능력."),
      ...everyOddFrom3("Phrenic Amplification", "증폭 능력을 추가로 얻습니다."),
    ],
    spellcasting: {
      profileId: "full9Spontaneous",
      ability: "int",
      tradition: "psychic",
      note: casterNote,
    },
  },
};

export const SPELL_SLOT_TABLES: Record<string, number[][]> = {
  none: [],

  full9Prepared: [
    [],
    [3, 1],
    [4, 2],
    [4, 2, 1],
    [4, 3, 2],
    [4, 3, 2, 1],
    [4, 3, 3, 2],
    [4, 4, 3, 2, 1],
    [4, 4, 3, 3, 2],
    [4, 4, 4, 3, 2, 1],
    [4, 4, 4, 3, 3, 2],
    [4, 4, 4, 4, 3, 2, 1],
    [4, 4, 4, 4, 3, 3, 2],
    [4, 4, 4, 4, 4, 3, 2, 1],
    [4, 4, 4, 4, 4, 3, 3, 2],
    [4, 4, 4, 4, 4, 4, 3, 2, 1],
    [4, 4, 4, 4, 4, 4, 3, 3, 2],
    [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],
    [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],
    [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  ],

  full9Spontaneous: [
    [],
    [4, 3],
    [5, 4],
    [5, 5],
    [6, 6, 3],
    [6, 6, 4],
    [7, 6, 5, 3],
    [7, 6, 6, 4],
    [8, 6, 6, 5, 3],
    [8, 6, 6, 6, 4],
    [9, 6, 6, 6, 5, 3],
    [9, 6, 6, 6, 6, 4],
    [9, 6, 6, 6, 6, 5, 3],
    [9, 6, 6, 6, 6, 6, 4],
    [9, 6, 6, 6, 6, 6, 5, 3],
    [9, 6, 6, 6, 6, 6, 6, 4],
    [9, 6, 6, 6, 6, 6, 6, 5, 3],
    [9, 6, 6, 6, 6, 6, 6, 6, 4],
    [9, 6, 6, 6, 6, 6, 6, 6, 5, 3],
    [9, 6, 6, 6, 6, 6, 6, 6, 6, 4],
    [9, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  ],

  sixPrepared: [
    [],
    [0],
    [1],
    [2],
    [3, 1],
    [3, 2],
    [3, 3],
    [4, 3, 1],
    [4, 3, 2],
    [4, 4, 3],
    [4, 4, 3, 1],
    [4, 4, 4, 2],
    [4, 4, 4, 3],
    [4, 4, 4, 3, 1],
    [4, 4, 4, 4, 2],
    [4, 4, 4, 4, 3],
    [4, 4, 4, 4, 3, 1],
    [4, 4, 4, 4, 4, 2],
    [4, 4, 4, 4, 4, 3],
    [4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4],
  ],

  sixSpontaneous: [
    [],
    [0],
    [1],
    [2],
    [3, 1],
    [4, 2],
    [4, 3],
    [4, 4, 1],
    [4, 4, 2],
    [5, 4, 3],
    [5, 4, 4, 1],
    [5, 5, 4, 2],
    [5, 5, 4, 3],
    [5, 5, 4, 4, 1],
    [5, 5, 5, 4, 2],
    [5, 5, 5, 4, 3],
    [5, 5, 5, 4, 4, 1],
    [5, 5, 5, 5, 4, 2],
    [5, 5, 5, 5, 4, 3],
    [5, 5, 5, 5, 4, 4],
    [5, 5, 5, 5, 5, 5],
  ],

  fourPrepared: [
    [],
    [],
    [],
    [],
    [0],
    [1],
    [1],
    [1, 0],
    [1, 1],
    [2, 1],
    [2, 1, 0],
    [2, 1, 1],
    [2, 2, 1],
    [3, 2, 1, 0],
    [3, 2, 1, 1],
    [3, 2, 2, 1],
    [3, 3, 2, 1],
    [4, 3, 2, 1],
    [4, 3, 2, 2],
    [4, 3, 3, 2],
    [4, 4, 3, 3],
  ],

  alchemistExtracts: [
    [],
    [1],
    [2],
    [3],
    [3, 1],
    [4, 2],
    [4, 3],
    [4, 3, 1],
    [4, 4, 2],
    [5, 4, 3],
    [5, 4, 3, 1],
    [5, 4, 4, 2],
    [5, 5, 4, 3],
    [5, 5, 4, 3, 1],
    [5, 5, 4, 4, 2],
    [5, 5, 5, 4, 3],
    [5, 5, 5, 4, 3, 1],
    [5, 5, 5, 4, 4, 2],
    [5, 5, 5, 5, 4, 3],
    [5, 5, 5, 5, 5, 4],
    [5, 5, 5, 5, 5, 5],
  ],

  summoner6: [
    [],
    [1],
    [2],
    [3],
    [3, 1],
    [4, 2],
    [4, 3],
    [4, 3, 1],
    [4, 4, 2],
    [5, 4, 3],
    [5, 4, 3, 1],
    [5, 4, 4, 2],
    [5, 5, 4, 3],
    [5, 5, 4, 3, 1],
    [5, 5, 4, 4, 2],
    [5, 5, 5, 4, 3],
    [5, 5, 5, 4, 3, 1],
    [5, 5, 5, 4, 4, 2],
    [5, 5, 5, 5, 4, 3],
    [5, 5, 5, 5, 5, 4],
    [5, 5, 5, 5, 5, 5],
  ],

  unchainedSummoner6: [
    [],
    [1],
    [2],
    [3],
    [3, 1],
    [4, 2],
    [4, 3],
    [4, 3, 1],
    [4, 4, 2],
    [5, 4, 3],
    [5, 4, 3, 1],
    [5, 4, 4, 2],
    [5, 5, 4, 3],
    [5, 5, 4, 3, 1],
    [5, 5, 4, 4, 2],
    [5, 5, 5, 4, 3],
    [5, 5, 5, 4, 3, 1],
    [5, 5, 5, 4, 4, 2],
    [5, 5, 5, 5, 4, 3],
    [5, 5, 5, 5, 5, 4],
    [5, 5, 5, 5, 5, 5],
  ],
};

const aliases = {
  barbarianUnchained: "barbarian",
  monkUnchained: "monk",
  rogueUnchained: "rogue",
  summonerUnchained: "summoner",
  ninja: "rogue",
  samurai: "cavalier",
  shifter: "ranger",
  vigilante: "rogue",
  kineticist: "none",
  medium: "sixSpontaneous",
  mesmerist: "sixSpontaneous",
  occultist: "sixPrepared",
  spiritualist: "sixSpontaneous",
} as const;

export function getClassAutomation(classId: string): ClassAutomation | undefined {
  if (CLASS_AUTOMATION[classId]) return CLASS_AUTOMATION[classId];

  if (classId === "medium") {
    return {
      features: [f(1, "Spirit", "영혼과 접촉합니다."), f(1, "Spirit Surge", "영혼의 힘으로 판정을 보조합니다.")],
      spellcasting: { profileId: "sixSpontaneous", ability: "cha", tradition: "spontaneous", note: casterNote },
    };
  }

  if (classId === "mesmerist") {
    return {
      features: [f(1, "Hypnotic Stare", "최면 응시."), f(1, "Mesmerist Trick", "메즈머리스트 트릭.")],
      spellcasting: { profileId: "sixSpontaneous", ability: "cha", tradition: "spontaneous", note: casterNote },
    };
  }

  if (classId === "occultist") {
    return {
      features: [f(1, "Implements", "구현구."), f(1, "Mental Focus", "정신 집중.")],
      spellcasting: { profileId: "sixPrepared", ability: "int", tradition: "prepared", note: casterNote },
    };
  }

  if (classId === "spiritualist") {
    return {
      features: [f(1, "Phantom", "팬텀 동료."), f(1, "Etheric Tether", "에테르 연결.")],
      spellcasting: { profileId: "sixSpontaneous", ability: "wis", tradition: "spontaneous", note: casterNote },
    };
  }

  const alias = aliases[classId as keyof typeof aliases];

  if (!alias || alias === "none") {
    return undefined;
  }

  if (CLASS_AUTOMATION[alias]) {
    return CLASS_AUTOMATION[alias];
  }

  return undefined;
}
