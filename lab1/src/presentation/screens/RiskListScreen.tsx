import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Risk } from '../../domain/entities/Risk';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '../components/EmptyState';
import { Filters } from '../components/Filters';
import { RiskSummary } from '../components/RiskSummary';
import { RiskTable } from '../components/RiskTable';
import { EMPTY_FILTERS } from '../state/riskFilters';
import { useRisks } from '../state/useRisks';

export function RiskListScreen() {
  const {
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
    remove,
  } = useRisks();

  const [pendingDelete, setPendingDelete] = useState<Risk | null>(null);

  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await remove(pendingDelete.id);
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riesgos de auditoría</h1>
          <p className="text-sm text-slate-500">
            Registro, evaluación y seguimiento de los riesgos identificados.
          </p>
        </div>
        <Link
          to="/risks/new"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Nuevo riesgo
        </Link>
      </header>

      <RiskSummary summary={summary} />

      <Filters
        filters={filters}
        onChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        onReset={resetFilters}
      />

      {loading && <LoadingState label="Cargando riesgos…" />}

      {!loading && error && <ErrorState message={error} onRetry={() => void reload()} />}

      {!loading && !error && risks.length === 0 && (
        <EmptyState
          title="Aún no hay riesgos registrados"
          description="Crea el primer riesgo para comenzar a construir la matriz de auditoría."
          action={
            <Link
              to="/risks/new"
              className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Crear riesgo
            </Link>
          }
        />
      )}

      {!loading && !error && risks.length > 0 && visibleRisks.length === 0 && (
        <EmptyState
          title="Ningún riesgo coincide con los filtros"
          description="Ajusta la búsqueda o limpia los filtros para ver más resultados."
          action={
            hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Limpiar filtros
              </button>
            )
          }
        />
      )}

      {!loading && !error && visibleRisks.length > 0 && (
        <>
          <p className="text-sm text-slate-500">
            Mostrando {visibleRisks.length} de {risks.length} riesgos.
          </p>
          <RiskTable risks={visibleRisks} onDelete={setPendingDelete} />
        </>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar riesgo"
        message={`¿Seguro que deseas eliminar "${pendingDelete?.title ?? ''}"? Esta acción no se puede deshacer.`}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
