import { RiskCategory, RiskStatus, type RiskInput } from '../domain/entities/Risk';

export function makeRiskInput(overrides: Partial<RiskInput> = {}): RiskInput {
  return {
    title: 'Riesgo de prueba',
    description: 'Descripción de prueba',
    category: RiskCategory.Operativo,
    probability: 3,
    impact: 3,
    owner: 'Auditoría Interna',
    status: RiskStatus.Abierto,
    mitigationPlan: '',
    ...overrides,
  };
}
