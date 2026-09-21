import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorState, LoadingState } from '../components/EmptyState';
import { RiskLevelBadge } from '../components/RiskLevelBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useUseCases } from '../state/RiskProvider';
import { useRisk } from '../state/useRisk';

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('es-MX');
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  );
}

export function RiskDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteRisk } = useUseCases();
  const { risk, loading, error, reload } = useRisk(id);
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (!id) return;
    try {
      await deleteRisk.execute(id);
      navigate('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'No se pudo eliminar el riesgo.');
      setConfirming(false);
    }
  }

  if (loading) return <LoadingState label="Cargando riesgo…" />;

  if (error || !risk) {
    return (
      <div className="space-y-4">
        <ErrorState message={error ?? 'Riesgo no encontrado.'} onRetry={() => void reload()} />
        <Link to="/" className="text-sm font-medium text-slate-600 hover:underline">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/" className="text-sm text-slate-500 hover:underline">
          ← Volver al listado
        </Link>
      </div>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{risk.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <RiskLevelBadge level={risk.level} score={risk.score} />
            <StatusBadge status={risk.status} />
            <span className="text-xs text-slate-500">{risk.category}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/risks/${risk.id}/edit`}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </header>

      {deleteError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {deleteError}
        </p>
      )}

      <dl className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <Field label="Responsable">{risk.owner}</Field>
        <Field label="Categoría">{risk.category}</Field>
        <Field label="Probabilidad">{risk.probability} / 5</Field>
        <Field label="Impacto">{risk.impact} / 5</Field>
        <Field label="Score">
          {risk.probability} × {risk.impact} = <strong>{risk.score}</strong>
        </Field>
        <Field label="Nivel">
          <RiskLevelBadge level={risk.level} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Descripción">
            {risk.description || <span className="text-slate-400">Sin descripción.</span>}
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Plan de mitigación">
            {risk.mitigationPlan || <span className="text-slate-400">Sin plan registrado.</span>}
          </Field>
        </div>
        <Field label="Creado">{formatDate(risk.createdAt)}</Field>
        <Field label="Última actualización">{formatDate(risk.updatedAt)}</Field>
      </dl>

      <ConfirmDialog
        open={confirming}
        title="Eliminar riesgo"
        message={`¿Seguro que deseas eliminar "${risk.title}"? Esta acción no se puede deshacer.`}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
