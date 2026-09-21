import { RiskLevel, type Risk, type RiskInput } from './Risk';

export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;
export const SCALE_MIN = 1;
export const SCALE_MAX = 5;

/** score = probabilidad × impacto. */
export function calculateScore(probability: number, impact: number): number {
  return probability * impact;
}

/** 1–6 Bajo, 7–14 Medio, 15–25 Alto. */
export function calculateRiskLevel(score: number): RiskLevel {
  if (score <= 6) return RiskLevel.Bajo;
  if (score <= 14) return RiskLevel.Medio;
  return RiskLevel.Alto;
}

/** Orden para ordenamientos: Bajo < Medio < Alto. */
export const RISK_LEVEL_WEIGHT: Record<RiskLevel, number> = {
  [RiskLevel.Bajo]: 1,
  [RiskLevel.Medio]: 2,
  [RiskLevel.Alto]: 3,
};

/** Normaliza texto de entrada (recorta espacios sobrantes). */
export function normalizeRiskInput(input: RiskInput): RiskInput {
  return {
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    owner: input.owner.trim(),
    mitigationPlan: input.mitigationPlan.trim(),
  };
}

/** Construye un riesgo nuevo con campos derivados y fechas. */
export function buildRisk(input: RiskInput, id: string, now: string): Risk {
  const normalized = normalizeRiskInput(input);
  const score = calculateScore(normalized.probability, normalized.impact);
  return {
    ...normalized,
    id,
    score,
    level: calculateRiskLevel(score),
    createdAt: now,
    updatedAt: now,
  };
}

/** Aplica cambios a un riesgo existente recalculando derivados. */
export function applyRiskChanges(current: Risk, input: RiskInput, now: string): Risk {
  const normalized = normalizeRiskInput(input);
  const score = calculateScore(normalized.probability, normalized.impact);
  return {
    ...current,
    ...normalized,
    score,
    level: calculateRiskLevel(score),
    updatedAt: now,
  };
}
