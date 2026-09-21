import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Risk, RiskInput } from '../../domain/entities/Risk';
import { RiskValidationError } from '../../domain/entities/riskValidation';
import { useUseCases } from './RiskProvider';
import {
  EMPTY_FILTERS,
  filterRisks,
  sortRisks,
  summarizeRisks,
  type RiskFiltersState,
  type SortKey,
} from './riskFilters';

function toMessage(error: unknown): string {
  if (error instanceof RiskValidationError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado.';
}

/**
 * Adaptador entre la UI y los casos de uso. Ningún componente conoce
 * repositorios ni localStorage.
 */
export function useRisks() {
  const { getRisks, createRisk, updateRisk, deleteRisk } = useUseCases();

  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RiskFiltersState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>('level-desc');

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRisks(await getRisks.execute());
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setLoading(false);
    }
  }, [getRisks]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const create = useCallback(
    async (input: RiskInput) => {
      const risk = await createRisk.execute(input);
      setRisks((prev) => [...prev, risk]);
      return risk;
    },
    [createRisk],
  );

  const update = useCallback(
    async (id: string, input: RiskInput) => {
      const risk = await updateRisk.execute(id, input);
      setRisks((prev) => prev.map((item) => (item.id === id ? risk : item)));
      return risk;
    },
    [updateRisk],
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await deleteRisk.execute(id);
        setRisks((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        setError(toMessage(err));
        throw err;
      }
    },
    [deleteRisk],
  );

  const visibleRisks = useMemo(
    () => sortRisks(filterRisks(risks, filters), sort),
    [risks, filters, sort],
  );

  const summary = useMemo(() => summarizeRisks(risks), [risks]);

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  return {
    risks,
    visibleRisks,
    summary,
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
    sort,
    setSort,
    reload,
    create,
    update,
    remove,
  };
}
