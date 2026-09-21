import type { Risk } from '../../domain/entities/Risk';
import { buildRisk } from '../../domain/entities/riskRules';
import type { KeyValueStorage } from '../../infrastructure/storage/StorageWrapper';
import { generateId } from '../../infrastructure/storage/uuid';
import { SEED_RISKS } from '../seed/seedRisks';
import type { RiskDataSource } from './RiskDataSource';

export const RISKS_STORAGE_KEY = 'auditoria.risks.v1';

/** Persistencia en localStorage, con carga inicial de ejemplos. */
export class LocalStorageRiskDataSource implements RiskDataSource {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly key: string = RISKS_STORAGE_KEY,
  ) {}

  async readAll(): Promise<Risk[]> {
    const stored = this.storage.read<Risk[]>(this.key);

    if (!Array.isArray(stored)) {
      const seeded = this.buildSeed();
      this.storage.write(this.key, seeded);
      return seeded;
    }

    return stored;
  }

  async writeAll(risks: Risk[]): Promise<void> {
    this.storage.write(this.key, risks);
  }

  private buildSeed(): Risk[] {
    const now = new Date().toISOString();
    return SEED_RISKS.map((input) => buildRisk(input, generateId(), now));
  }
}
