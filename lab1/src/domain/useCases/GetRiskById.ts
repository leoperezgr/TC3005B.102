import type { Risk } from '../entities/Risk';
import { RiskNotFoundError } from '../entities/riskValidation';
import type { RiskRepository } from '../repositories/RiskRepository';

export class GetRiskById {
  constructor(private readonly repository: RiskRepository) {}

  async execute(id: string): Promise<Risk> {
    const risk = await this.repository.getById(id);
    if (!risk) throw new RiskNotFoundError(id);
    return risk;
  }
}
