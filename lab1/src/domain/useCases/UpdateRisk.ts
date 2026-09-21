import type { Risk, RiskInput } from '../entities/Risk';
import {
  RiskNotFoundError,
  RiskValidationError,
  validateRisk,
} from '../entities/riskValidation';
import type { RiskRepository } from '../repositories/RiskRepository';

export class UpdateRisk {
  constructor(private readonly repository: RiskRepository) {}

  async execute(id: string, input: RiskInput): Promise<Risk> {
    const { valid, errors } = validateRisk(input);
    if (!valid) throw new RiskValidationError(errors);

    const existing = await this.repository.getById(id);
    if (!existing) throw new RiskNotFoundError(id);

    return this.repository.update(id, input);
  }
}
