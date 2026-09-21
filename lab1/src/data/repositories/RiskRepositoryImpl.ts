import type { Risk, RiskInput } from '../../domain/entities/Risk';
import { applyRiskChanges, buildRisk } from '../../domain/entities/riskRules';
import { RiskNotFoundError } from '../../domain/entities/riskValidation';
import type { RiskRepository } from '../../domain/repositories/RiskRepository';
import { generateId } from '../../infrastructure/storage/uuid';
import type { RiskDataSource } from '../sources/RiskDataSource';

/**
 * Implementa el contrato del dominio sobre una fuente de datos intercambiable.
 * Sustituir `LocalStorageRiskDataSource` por una fuente HTTP no requiere tocar
 * ni el dominio ni la presentación.
 */
export class RiskRepositoryImpl implements RiskRepository {
  constructor(
    private readonly dataSource: RiskDataSource,
    private readonly idFactory: () => string = generateId,
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  async getAll(): Promise<Risk[]> {
    return this.dataSource.readAll();
  }

  async getById(id: string): Promise<Risk | null> {
    const risks = await this.dataSource.readAll();
    return risks.find((risk) => risk.id === id) ?? null;
  }

  async create(input: RiskInput): Promise<Risk> {
    const risks = await this.dataSource.readAll();
    const risk = buildRisk(input, this.idFactory(), this.clock());
    await this.dataSource.writeAll([...risks, risk]);
    return risk;
  }

  async update(id: string, input: RiskInput): Promise<Risk> {
    const risks = await this.dataSource.readAll();
    const index = risks.findIndex((risk) => risk.id === id);
    if (index === -1) throw new RiskNotFoundError(id);

    const updated = applyRiskChanges(risks[index], input, this.clock());
    const next = [...risks];
    next[index] = updated;
    await this.dataSource.writeAll(next);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const risks = await this.dataSource.readAll();
    const next = risks.filter((risk) => risk.id !== id);
    if (next.length === risks.length) throw new RiskNotFoundError(id);
    await this.dataSource.writeAll(next);
  }
}
