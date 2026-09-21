import type { Risk, RiskInput } from '../entities/Risk';

/**
 * Contrato de persistencia. La implementación (localStorage hoy, API REST
 * mañana) vive en la capa de datos; el dominio solo conoce esta interfaz.
 */
export interface RiskRepository {
  getAll(): Promise<Risk[]>;
  getById(id: string): Promise<Risk | null>;
  create(input: RiskInput): Promise<Risk>;
  update(id: string, input: RiskInput): Promise<Risk>;
  delete(id: string): Promise<void>;
}
