import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Risk, RiskInput } from '../../domain/entities/Risk';
import { ErrorState, LoadingState } from '../components/EmptyState';
import { RiskForm } from '../components/RiskForm';
import { useUseCases } from '../state/RiskProvider';
import { useRisk } from '../state/useRisk';

function toInput(risk: Risk): RiskInput {
  return {
    title: risk.title,
    description: risk.description,
    category: risk.category,
    probability: risk.probability,
    impact: risk.impact,
    owner: risk.owner,
    status: risk.status,
    mitigationPlan: risk.mitigationPlan,
  };
}

/** Misma pantalla para crear y editar; el modo lo decide la presencia de `id`. */
export function RiskFormScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createRisk, updateRisk } = useUseCases();
  const isEditing = Boolean(id);
  const { risk, loading, error, reload } = useRisk(isEditing ? id : undefined);

  async function handleSubmit(input: RiskInput) {
    if (isEditing && id) {
      await updateRisk.execute(id, input);
      navigate(`/risks/${id}`);
    } else {
      const created = await createRisk.execute(input);
      navigate(`/risks/${created.id}`);
    }
  }

  if (isEditing && loading) return <LoadingState label="Cargando riesgo…" />;
  if (isEditing && (error || !risk)) {
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
      <header>
        <Link to={isEditing && id ? `/risks/${id}` : '/'} className="text-sm text-slate-500 hover:underline">
          ← Volver
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {isEditing ? 'Editar riesgo' : 'Nuevo riesgo'}
        </h1>
        <p className="text-sm text-slate-500">
          El nivel se calcula automáticamente a partir de la probabilidad y el impacto.
        </p>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <RiskForm
          initialValue={risk ? toInput(risk) : undefined}
          submitLabel={isEditing ? 'Guardar cambios' : 'Crear riesgo'}
          onSubmit={handleSubmit}
          onCancel={() => navigate(isEditing && id ? `/risks/${id}` : '/')}
        />
      </div>
    </div>
  );
}
