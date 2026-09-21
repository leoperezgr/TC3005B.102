import { RiskNotFoundError } from '../entities/riskValidation';
import type { RiskRepository } from '../repositories/RiskRepository';

export class DeleteRisk {
  constructor(private readonly repository: RiskRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) throw new RiskNotFoundError(id);
    await this.repository.delete(id);
  }
}
