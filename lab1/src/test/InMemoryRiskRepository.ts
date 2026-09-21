import type { Risk, RiskInput } from '../domain/entities/Risk';
import { applyRiskChanges, buildRisk } from '../domain/entities/riskRules';
import { RiskNotFoundError } from '../domain/entities/riskValidation';
import type { RiskRepository } from '../domain/repositories/RiskRepository';

/** Doble de prueba del repositorio, sin localStorage ni red. */
export class InMemoryRiskRepository implements RiskRepository {
  private risks: Risk[];
  private sequence = 0;

  constructor(initial: Risk[] = []) {
    this.risks = [...initial];
  }

  async getAll(): Promise<Risk[]> {
    return [...this.risks];
  }

  async getById(id: string): Promise<Risk | null> {
    return this.risks.find((risk) => risk.id === id) ?? null;
  }

  async create(input: RiskInput): Promise<Risk> {
    const risk = buildRisk(input, `risk-${++this.sequence}`, '2026-01-01T00:00:00.000Z');
    this.risks.push(risk);
    return risk;
  }

  async update(id: string, input: RiskInput): Promise<Risk> {
    const index = this.risks.findIndex((risk) => risk.id === id);
    if (index === -1) throw new RiskNotFoundError(id);
    const updated = applyRiskChanges(this.risks[index], input, '2026-02-01T00:00:00.000Z');
    this.risks[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = this.risks.findIndex((risk) => risk.id === id);
    if (index === -1) throw new RiskNotFoundError(id);
    this.risks.splice(index, 1);
  }
}
