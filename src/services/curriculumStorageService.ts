import {
  EPIC_CONCEPT_CARDS,
  VIETNAM_EPIC_DOSSIERS,
  WORLD_EPIC_DOSSIERS,
} from '../data/literaryCurriculumData';
import { EpicConceptCard, EpicDossier } from '../types/museum';

const DOSSIER_OVERRIDES_KEY = 'suthiso_teacher_dossier_overrides_v1';
const CONCEPT_OVERRIDES_KEY = 'suthiso_teacher_concept_overrides_v1';

export type DossierOverrideMap = Record<string, Partial<EpicDossier>>;
export type ConceptOverrideMap = Record<string, Partial<EpicConceptCard>>;

export function loadDossierOverrides(): DossierOverrideMap {
  try {
    const raw = localStorage.getItem(DOSSIER_OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as DossierOverrideMap) : {};
  } catch {
    return {};
  }
}

export function saveDossierOverride(id: string, patch: Partial<EpicDossier>): DossierOverrideMap {
  const current = loadDossierOverrides();
  const next: DossierOverrideMap = {
    ...current,
    [id]: { ...(current[id] || {}), ...patch },
  };
  try {
    localStorage.setItem(DOSSIER_OVERRIDES_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage unavailability
  }
  return next;
}

export function loadConceptOverrides(): ConceptOverrideMap {
  try {
    const raw = localStorage.getItem(CONCEPT_OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as ConceptOverrideMap) : {};
  } catch {
    return {};
  }
}

export function saveConceptOverride(
  id: string,
  patch: Partial<EpicConceptCard>
): ConceptOverrideMap {
  const current = loadConceptOverrides();
  const next: ConceptOverrideMap = {
    ...current,
    [id]: { ...(current[id] || {}), ...patch },
  };
  try {
    localStorage.setItem(CONCEPT_OVERRIDES_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage unavailability
  }
  return next;
}

export function getMergedVietnamDossiers(): EpicDossier[] {
  const overrides = loadDossierOverrides();
  return VIETNAM_EPIC_DOSSIERS.map((d) => ({ ...d, ...(overrides[d.id] || {}) }));
}

export function getMergedWorldDossiers(): EpicDossier[] {
  const overrides = loadDossierOverrides();
  return WORLD_EPIC_DOSSIERS.map((d) => ({ ...d, ...(overrides[d.id] || {}) }));
}

export function getMergedConceptCards(): EpicConceptCard[] {
  const overrides = loadConceptOverrides();
  return EPIC_CONCEPT_CARDS.map((c) => ({ ...c, ...(overrides[c.id] || {}) }));
}

export function resetAllCurriculumOverrides(): void {
  try {
    localStorage.removeItem(DOSSIER_OVERRIDES_KEY);
    localStorage.removeItem(CONCEPT_OVERRIDES_KEY);
  } catch {
    // Ignore
  }
}
