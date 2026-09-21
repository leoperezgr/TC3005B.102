import type { Risk } from '../entities/Risk';
import type { RiskRepository } from '../repositories/RiskRepository';

export class GetRisks {
  constructor(private readonly repository: RiskRepository) {}

  execute(): Promise<Risk[]> {
    return this.repository.getAll();
  }
}
