import type { Risk, RiskCategory, RiskLevel, RiskStatus } from '../../domain/entities/Risk';
import { RISK_LEVEL_WEIGHT } from '../../domain/entities/riskRules';

export interface RiskFiltersState {
  search: string;
  category: RiskCategory | 'all';
  level: RiskLevel | 'all';
  status: RiskStatus | 'all';
}

export type SortKey = 'level-desc' | 'level-asc' | 'date-desc' | 'date-asc';

export const EMPTY_FILTERS: RiskFiltersState = {
  search: '',
  category: 'all',
  level: 'all',
  status: 'all',
};

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'level-desc', label: 'Nivel (mayor a menor)' },
  { value: 'level-asc', label: 'Nivel (menor a mayor)' },
  { value: 'date-desc', label: 'Fecha (más reciente)' },
  { value: 'date-asc', label: 'Fecha (más antigua)' },
];

function matchesSearch(risk: Risk, search: string): boolean {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return (
    risk.title.toLowerCase().includes(term) ||
    risk.owner.toLowerCase().includes(term)
  );
}

export function filterRisks(risks: Risk[], filters: RiskFiltersState): Risk[] {
  return risks.filter(
    (risk) =>
      matchesSearch(risk, filters.search) &&
      (filters.category === 'all' || risk.category === filters.category) &&
      (filters.level === 'all' || risk.level === filters.level) &&
      (filters.status === 'all' || risk.status === filters.status),
  );
}

export function sortRisks(risks: Risk[], sort: SortKey): Risk[] {
  const sorted = [...risks];
  sorted.sort((a, b) => {
    switch (sort) {
      case 'level-desc':
        return RISK_LEVEL_WEIGHT[b.level] - RISK_LEVEL_WEIGHT[a.level] || b.score - a.score;
      case 'level-asc':
        return RISK_LEVEL_WEIGHT[a.level] - RISK_LEVEL_WEIGHT[b.level] || a.score - b.score;
      case 'date-desc':
        return b.createdAt.localeCompare(a.createdAt);
      case 'date-asc':
        return a.createdAt.localeCompare(b.createdAt);
    }
  });
  return sorted;
}

export interface RiskSummaryCounts {
  total: number;
  alto: number;
  medio: number;
  bajo: number;
}

export function summarizeRisks(risks: Risk[]): RiskSummaryCounts {
  return risks.reduce<RiskSummaryCounts>(
    (acc, risk) => {
      acc.total += 1;
      if (risk.level === 'Alto') acc.alto += 1;
      else if (risk.level === 'Medio') acc.medio += 1;
      else acc.bajo += 1;
      return acc;
    },
    { total: 0, alto: 0, medio: 0, bajo: 0 },
  );
}
