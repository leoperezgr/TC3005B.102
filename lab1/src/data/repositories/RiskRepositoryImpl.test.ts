import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryStorage } from '../../infrastructure/storage/StorageWrapper';
import { makeRiskInput } from '../../test/factories';
import { LocalStorageRiskDataSource, RISKS_STORAGE_KEY } from '../sources/LocalStorageRiskDataSource';
import { SEED_RISKS } from '../seed/seedRisks';
import { RiskRepositoryImpl } from './RiskRepositoryImpl';

let storage: InMemoryStorage;
let repository: RiskRepositoryImpl;

beforeEach(() => {
  storage = new InMemoryStorage();
  repository = new RiskRepositoryImpl(new LocalStorageRiskDataSource(storage));
});

describe('carga inicial', () => {
  it('siembra los riesgos de ejemplo cuando el almacenamiento está vacío', async () => {
    const risks = await repository.getAll();
    expect(risks).toHaveLength(SEED_RISKS.length);
    expect(storage.read(RISKS_STORAGE_KEY)).toHaveLength(SEED_RISKS.length);
  });

  it('no vuelve a sembrar si ya hay datos guardados', async () => {
    storage.write(RISKS_STORAGE_KEY, []);
    expect(await repository.getAll()).toEqual([]);
  });
});

describe('persistencia CRUD', () => {
  it('crea, actualiza y elimina persistiendo en el almacenamiento', async () => {
    const created = await repository.create(makeRiskInput({ title: 'Riesgo nuevo' }));
    expect(await repository.getById(created.id)).toMatchObject({ title: 'Riesgo nuevo' });

    await repository.update(created.id, makeRiskInput({ title: 'Riesgo editado' }));
    expect((await repository.getById(created.id))?.title).toBe('Riesgo editado');

    await repository.delete(created.id);
    expect(await repository.getById(created.id)).toBeNull();
  });

  it('los datos sobreviven a una nueva instancia del repositorio', async () => {
    const created = await repository.create(makeRiskInput({ title: 'Persistente' }));

    const otro = new RiskRepositoryImpl(new LocalStorageRiskDataSource(storage));
    expect((await otro.getById(created.id))?.title).toBe('Persistente');
  });
});
