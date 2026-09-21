import { useCallback, useEffect, useState } from 'react';
import type { Risk } from '../../domain/entities/Risk';
import { useUseCases } from './RiskProvider';

/** Carga un riesgo individual por id (detalle y edición). */
export function useRisk(id: string | undefined) {
  const { getRiskById } = useUseCases();
  const [risk, setRisk] = useState<Risk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError('No se indicó un identificador de riesgo.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRisk(await getRiskById.execute(id));
    } catch (err) {
      setRisk(null);
      setError(err instanceof Error ? err.message : 'No se pudo cargar el riesgo.');
    } finally {
      setLoading(false);
    }
  }, [getRiskById, id]);

  useEffect(() => {
    void load();
  }, [load]);

  return { risk, loading, error, reload: load };
}
