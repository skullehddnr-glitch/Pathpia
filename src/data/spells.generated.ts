import type { SpellEntry } from "./spells";
import generatedSpellsJson from "./spells.generated.json?raw";

export const GENERATED_SPELLS = JSON.parse(generatedSpellsJson) as SpellEntry[];
