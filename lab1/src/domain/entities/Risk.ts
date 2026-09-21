/**
 * Entidad Risk y sus enumeraciones.
 * Capa de dominio: no importa nada de data, infrastructure ni presentation.
 */

export const RiskCategory = {
  Operativo: 'Operativo',
  Financiero: 'Financiero',
  Tecnologico: 'Tecnológico',
  Legal: 'Legal',
  Reputacional: 'Reputacional',
} as const;

export type RiskCategory = (typeof RiskCategory)[keyof typeof RiskCategory];

export const RISK_CATEGORIES: readonly RiskCategory[] = Object.values(RiskCategory);

export const RiskStatus = {
  Abierto: 'Abierto',
  EnMitigacion: 'En mitigación',
  Cerrado: 'Cerrado',
} as const;

export type RiskStatus = (typeof RiskStatus)[keyof typeof RiskStatus];

export const RISK_STATUSES: readonly RiskStatus[] = Object.values(RiskStatus);

export const RiskLevel = {
  Bajo: 'Bajo',
  Medio: 'Medio',
  Alto: 'Alto',
} as const;

export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const RISK_LEVELS: readonly RiskLevel[] = Object.values(RiskLevel);

/** Escala válida para probabilidad e impacto. */
export type RiskScale = 1 | 2 | 3 | 4 | 5;

export const RISK_SCALE_VALUES: readonly RiskScale[] = [1, 2, 3, 4, 5];

/** Riesgo tal como se persiste y se consume en la aplicación. */
export interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  probability: number;
  impact: number;
  /** Derivado: probability × impact. */
  score: number;
  /** Derivado a partir de score. */
  level: RiskLevel;
  owner: string;
  status: RiskStatus;
  mitigationPlan: string;
  createdAt: string;
  updatedAt: string;
}

/** Datos que el usuario captura; el dominio deriva el resto. */
export interface RiskInput {
  title: string;
  description: string;
  category: RiskCategory;
  probability: number;
  impact: number;
  owner: string;
  status: RiskStatus;
  mitigationPlan: string;
}
