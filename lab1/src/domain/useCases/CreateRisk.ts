import type { Risk, RiskInput } from '../entities/Risk';
import { RiskValidationError, validateRisk } from '../entities/riskValidation';
import type { RiskRepository } from '../repositories/RiskRepository';

export class CreateRisk {
  constructor(private readonly repository: RiskRepository) {}

  async execute(input: RiskInput): Promise<Risk> {
    const { valid, errors } = validateRisk(input);
    if (!valid) throw new RiskValidationError(errors);
    return this.repository.create(input);
  }
}
