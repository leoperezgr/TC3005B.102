import { describe, expect, it } from 'vitest';
import { RiskLevel } from './Risk';
import {
  applyRiskChanges,
  buildRisk,
  calculateRiskLevel,
  calculateScore,
  normalizeRiskInput,
} from './riskRules';
import { makeRiskInput } from '../../test/factories';

describe('calculateScore', () => {
  it('multiplica probabilidad por impacto', () => {
    expect(calculateScore(4, 5)).toBe(20);
    expect(calculateScore(1, 1)).toBe(1);
  });
});

describe('calculateRiskLevel', () => {
  it('clasifica 1–6 como Bajo', () => {
    for (const score of [1, 2, 4, 6]) {
      expect(calculateRiskLevel(score)).toBe(RiskLevel.Bajo);
    }
  });

  it('clasifica 7–14 como Medio', () => {
    for (const score of [7, 10, 14]) {
      expect(calculateRiskLevel(score)).toBe(RiskLevel.Medio);
    }
  });

  it('clasifica 15–25 como Alto', () => {
    for (const score of [15, 20, 25]) {
      expect(calculateRiskLevel(score)).toBe(RiskLevel.Alto);
    }
  });

  it('respeta los límites exactos de cada rango', () => {
    expect(calculateRiskLevel(6)).toBe(RiskLevel.Bajo);
    expect(calculateRiskLevel(7)).toBe(RiskLevel.Medio);
    expect(calculateRiskLevel(14)).toBe(RiskLevel.Medio);
    expect(calculateRiskLevel(15)).toBe(RiskLevel.Alto);
  });
});

describe('normalizeRiskInput', () => {
  it('recorta espacios en los campos de texto', () => {
    const result = normalizeRiskInput(
      makeRiskInput({ title: '  Fraude  ', owner: ' Ana ', mitigationPlan: ' Plan ' }),
    );
    expect(result.title).toBe('Fraude');
    expect(result.owner).toBe('Ana');
    expect(result.mitigationPlan).toBe('Plan');
  });
});

describe('buildRisk', () => {
  it('deriva score, nivel y fechas', () => {
    const risk = buildRisk(
      makeRiskInput({ probability: 5, impact: 5 }),
      'abc',
      '2026-01-01T00:00:00.000Z',
    );
    expect(risk.id).toBe('abc');
    expect(risk.score).toBe(25);
    expect(risk.level).toBe(RiskLevel.Alto);
    expect(risk.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(risk.updatedAt).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('applyRiskChanges', () => {
  it('recalcula derivados y actualiza updatedAt conservando createdAt e id', () => {
    const original = buildRisk(
      makeRiskInput({ probability: 1, impact: 1 }),
      'abc',
      '2026-01-01T00:00:00.000Z',
    );

    const updated = applyRiskChanges(
      original,
      makeRiskInput({ probability: 4, impact: 4 }),
      '2026-03-01T00:00:00.000Z',
    );

    expect(updated.id).toBe('abc');
    expect(updated.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(updated.updatedAt).toBe('2026-03-01T00:00:00.000Z');
    expect(updated.score).toBe(16);
    expect(updated.level).toBe(RiskLevel.Alto);
  });
});
