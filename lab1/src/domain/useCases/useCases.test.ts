import { beforeEach, describe, expect, it } from 'vitest';
import { RiskLevel } from '../entities/Risk';
import { RiskNotFoundError, RiskValidationError } from '../entities/riskValidation';
import { InMemoryRiskRepository } from '../../test/InMemoryRiskRepository';
import { makeRiskInput } from '../../test/factories';
import { CreateRisk } from './CreateRisk';
import { DeleteRisk } from './DeleteRisk';
import { GetRiskById } from './GetRiskById';
import { GetRisks } from './GetRisks';
import { UpdateRisk } from './UpdateRisk';

let repository: InMemoryRiskRepository;

beforeEach(() => {
  repository = new InMemoryRiskRepository();
});

describe('CreateRisk', () => {
  it('persiste un riesgo válido con derivados calculados', async () => {
    const created = await new CreateRisk(repository).execute(
      makeRiskInput({ probability: 5, impact: 4 }),
    );

    expect(created.score).toBe(20);
    expect(created.level).toBe(RiskLevel.Alto);
    expect(await repository.getAll()).toHaveLength(1);
  });

  it('lanza RiskValidationError y no persiste si la entrada es inválida', async () => {
    const useCase = new CreateRisk(repository);

    await expect(useCase.execute(makeRiskInput({ title: '' }))).rejects.toBeInstanceOf(
      RiskValidationError,
    );
    expect(await repository.getAll()).toHaveLength(0);
  });

  it('expone los errores por campo en la excepción', async () => {
    try {
      await new CreateRisk(repository).execute(makeRiskInput({ owner: '' }));
      expect.unreachable('debió lanzar');
    } catch (error) {
      expect(error).toBeInstanceOf(RiskValidationError);
      expect((error as RiskValidationError).errors.owner).toBeDefined();
    }
  });
});

describe('GetRisks', () => {
  it('devuelve una lista vacía cuando no hay riesgos', async () => {
    expect(await new GetRisks(repository).execute()).toEqual([]);
  });

  it('devuelve todos los riesgos almacenados', async () => {
    const create = new CreateRisk(repository);
    await create.execute(makeRiskInput({ title: 'Riesgo uno' }));
    await create.execute(makeRiskInput({ title: 'Riesgo dos' }));

    expect(await new GetRisks(repository).execute()).toHaveLength(2);
  });
});

describe('GetRiskById', () => {
  it('devuelve el riesgo solicitado', async () => {
    const created = await new CreateRisk(repository).execute(makeRiskInput());
    expect((await new GetRiskById(repository).execute(created.id)).id).toBe(created.id);
  });

  it('lanza RiskNotFoundError si no existe', async () => {
    await expect(new GetRiskById(repository).execute('missing')).rejects.toBeInstanceOf(
      RiskNotFoundError,
    );
  });
});

describe('UpdateRisk', () => {
  it('actualiza y recalcula el nivel', async () => {
    const created = await new CreateRisk(repository).execute(
      makeRiskInput({ probability: 1, impact: 1 }),
    );
    expect(created.level).toBe(RiskLevel.Bajo);

    const updated = await new UpdateRisk(repository).execute(
      created.id,
      makeRiskInput({ title: 'Título nuevo', probability: 4, impact: 3 }),
    );

    expect(updated.title).toBe('Título nuevo');
    expect(updated.score).toBe(12);
    expect(updated.level).toBe(RiskLevel.Medio);
    expect(updated.createdAt).toBe(created.createdAt);
    expect(updated.updatedAt).not.toBe(created.updatedAt);
  });

  it('lanza RiskValidationError con entrada inválida', async () => {
    const created = await new CreateRisk(repository).execute(makeRiskInput());
    await expect(
      new UpdateRisk(repository).execute(created.id, makeRiskInput({ impact: 99 })),
    ).rejects.toBeInstanceOf(RiskValidationError);
  });

  it('lanza RiskNotFoundError si el riesgo no existe', async () => {
    await expect(
      new UpdateRisk(repository).execute('missing', makeRiskInput()),
    ).rejects.toBeInstanceOf(RiskNotFoundError);
  });
});

describe('DeleteRisk', () => {
  it('elimina el riesgo indicado', async () => {
    const created = await new CreateRisk(repository).execute(makeRiskInput());
    await new DeleteRisk(repository).execute(created.id);
    expect(await repository.getAll()).toHaveLength(0);
  });

  it('lanza RiskNotFoundError si el riesgo no existe', async () => {
    await expect(new DeleteRisk(repository).execute('missing')).rejects.toBeInstanceOf(
      RiskNotFoundError,
    );
  });
});
