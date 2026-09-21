import { RiskRepositoryImpl } from '../data/repositories/RiskRepositoryImpl';
import { LocalStorageRiskDataSource } from '../data/sources/LocalStorageRiskDataSource';
import type { RiskRepository } from '../domain/repositories/RiskRepository';
import {
  CreateRisk,
  DeleteRisk,
  GetRiskById,
  GetRisks,
  UpdateRisk,
} from '../domain/useCases';
import {
  InMemoryStorage,
  LocalStorageWrapper,
  type KeyValueStorage,
} from '../infrastructure/storage/StorageWrapper';

export interface RiskUseCases {
  getRisks: GetRisks;
  getRiskById: GetRiskById;
  createRisk: CreateRisk;
  updateRisk: UpdateRisk;
  deleteRisk: DeleteRisk;
}

export interface Container {
  riskRepository: RiskRepository;
  useCases: RiskUseCases;
}

/** Único punto donde se decide la implementación concreta de persistencia. */
function defaultStorage(): KeyValueStorage {
  return typeof window === 'undefined'
    ? new InMemoryStorage()
    : new LocalStorageWrapper();
}

export function createContainer(
  storage: KeyValueStorage = defaultStorage(),
): Container {
  // Para migrar a API REST: sustituir por `new HttpRiskDataSource(httpClient)`.
  const dataSource = new LocalStorageRiskDataSource(storage);
  const riskRepository = new RiskRepositoryImpl(dataSource);

  return {
    riskRepository,
    useCases: {
      getRisks: new GetRisks(riskRepository),
      getRiskById: new GetRiskById(riskRepository),
      createRisk: new CreateRisk(riskRepository),
      updateRisk: new UpdateRisk(riskRepository),
      deleteRisk: new DeleteRisk(riskRepository),
    },
  };
}

/** Instancia compartida por la aplicación. */
export const container = createContainer();
