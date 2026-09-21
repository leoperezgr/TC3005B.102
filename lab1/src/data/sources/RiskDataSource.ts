import type { Risk } from '../../domain/entities/Risk';

/** Fuente de datos cruda: solo persiste, no valida ni deriva campos. */
export interface RiskDataSource {
  readAll(): Promise<Risk[]>;
  writeAll(risks: Risk[]): Promise<void>;
}
