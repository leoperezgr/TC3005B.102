import { describe, expect, it } from 'vitest';
import { validateRisk } from './riskValidation';
import { makeRiskInput } from '../../test/factories';

describe('validateRisk', () => {
  it('acepta una entrada válida', () => {
    expect(validateRisk(makeRiskInput()).valid).toBe(true);
  });

  it('exige título', () => {
    const { valid, errors } = validateRisk(makeRiskInput({ title: '   ' }));
    expect(valid).toBe(false);
    expect(errors.title).toBeDefined();
  });

  it('rechaza títulos de menos de 3 caracteres', () => {
    expect(validateRisk(makeRiskInput({ title: 'ab' })).errors.title).toBeDefined();
  });

  it('acepta títulos de exactamente 3 y 100 caracteres', () => {
    expect(validateRisk(makeRiskInput({ title: 'abc' })).valid).toBe(true);
    expect(validateRisk(makeRiskInput({ title: 'a'.repeat(100) })).valid).toBe(true);
  });

  it('rechaza títulos de más de 100 caracteres', () => {
    expect(validateRisk(makeRiskInput({ title: 'a'.repeat(101) })).errors.title).toBeDefined();
  });

  it('permite descripción vacía y rechaza más de 500 caracteres', () => {
    expect(validateRisk(makeRiskInput({ description: '' })).valid).toBe(true);
    expect(validateRisk(makeRiskInput({ description: 'a'.repeat(500) })).valid).toBe(true);
    expect(
      validateRisk(makeRiskInput({ description: 'a'.repeat(501) })).errors.description,
    ).toBeDefined();
  });

  it('exige responsable', () => {
    expect(validateRisk(makeRiskInput({ owner: '  ' })).errors.owner).toBeDefined();
  });

  it('rechaza probabilidad e impacto fuera de la escala 1–5', () => {
    expect(validateRisk(makeRiskInput({ probability: 0 })).errors.probability).toBeDefined();
    expect(validateRisk(makeRiskInput({ probability: 6 })).errors.probability).toBeDefined();
    expect(validateRisk(makeRiskInput({ impact: 0 })).errors.impact).toBeDefined();
    expect(validateRisk(makeRiskInput({ impact: 6 })).errors.impact).toBeDefined();
  });

  it('rechaza probabilidad no entera', () => {
    expect(validateRisk(makeRiskInput({ probability: 2.5 })).errors.probability).toBeDefined();
  });

  it('rechaza categoría y estado fuera del enum', () => {
    const invalid = validateRisk(
      makeRiskInput({
        category: 'Ambiental' as never,
        status: 'Pendiente' as never,
      }),
    );
    expect(invalid.errors.category).toBeDefined();
    expect(invalid.errors.status).toBeDefined();
  });

  it('acumula todos los errores de una entrada inválida', () => {
    const { errors } = validateRisk(
      makeRiskInput({ title: '', owner: '', probability: 9, impact: -1 }),
    );
    expect(Object.keys(errors).sort()).toEqual(['impact', 'owner', 'probability', 'title']);
  });
});
