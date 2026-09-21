import { useMemo, useState, type FormEvent } from 'react';
import {
  RISK_CATEGORIES,
  RISK_SCALE_VALUES,
  RISK_STATUSES,
  RiskCategory,
  RiskStatus,
  type RiskInput,
} from '../../domain/entities/Risk';
import {
  DESCRIPTION_MAX_LENGTH,
  calculateRiskLevel,
  calculateScore,
} from '../../domain/entities/riskRules';
import {
  validateRisk,
  type RiskValidationErrors,
} from '../../domain/entities/riskValidation';
import { RiskLevelBadge } from './RiskLevelBadge';

const EMPTY_INPUT: RiskInput = {
  title: '',
  description: '',
  category: RiskCategory.Operativo,
  probability: 1,
  impact: 1,
  owner: '',
  status: RiskStatus.Abierto,
  mitigationPlan: '',
};

const fieldClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500';
const errorFieldClass = 'border-red-400 focus:border-red-500 focus:ring-red-500';

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

export function RiskForm({
  initialValue,
  submitLabel = 'Guardar',
  onSubmit,
  onCancel,
}: {
  initialValue?: RiskInput;
  submitLabel?: string;
  onSubmit: (input: RiskInput) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<RiskInput>(initialValue ?? EMPTY_INPUT);
  const [errors, setErrors] = useState<RiskValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { score, level } = useMemo(() => {
    const value = calculateScore(values.probability, values.impact);
    return { score: value, level: calculateRiskLevel(value) };
  }, [values.probability, values.impact]);

  function setField<K extends keyof RiskInput>(key: K, value: RiskInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const result = validateRisk(values);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'No se pudo guardar el riesgo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={(e) => setField('title', e.target.value)}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'title-error' : undefined}
          className={`${fieldClass} ${errors.title ? errorFieldClass : ''}`}
        />
        <FieldError id="title-error" message={errors.title} />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'description-error' : undefined}
          className={`${fieldClass} ${errors.description ? errorFieldClass : ''}`}
        />
        <div className="mt-1 flex justify-between">
          <FieldError id="description-error" message={errors.description} />
          <span className="text-xs text-slate-400">
            {values.description.length}/{DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={values.category}
            onChange={(e) => setField('category', e.target.value as RiskCategory)}
            className={`${fieldClass} ${errors.category ? errorFieldClass : ''}`}
          >
            {RISK_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <FieldError id="category-error" message={errors.category} />
        </div>

        <div>
          <label htmlFor="owner" className="mb-1 block text-sm font-medium text-slate-700">
            Responsable <span className="text-red-500">*</span>
          </label>
          <input
            id="owner"
            name="owner"
            type="text"
            value={values.owner}
            onChange={(e) => setField('owner', e.target.value)}
            aria-invalid={Boolean(errors.owner)}
            aria-describedby={errors.owner ? 'owner-error' : undefined}
            className={`${fieldClass} ${errors.owner ? errorFieldClass : ''}`}
          />
          <FieldError id="owner-error" message={errors.owner} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="probability" className="mb-1 block text-sm font-medium text-slate-700">
            Probabilidad (1–5) <span className="text-red-500">*</span>
          </label>
          <select
            id="probability"
            name="probability"
            value={values.probability}
            onChange={(e) => setField('probability', Number(e.target.value))}
            className={`${fieldClass} ${errors.probability ? errorFieldClass : ''}`}
          >
            {RISK_SCALE_VALUES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <FieldError id="probability-error" message={errors.probability} />
        </div>

        <div>
          <label htmlFor="impact" className="mb-1 block text-sm font-medium text-slate-700">
            Impacto (1–5) <span className="text-red-500">*</span>
          </label>
          <select
            id="impact"
            name="impact"
            value={values.impact}
            onChange={(e) => setField('impact', Number(e.target.value))}
            className={`${fieldClass} ${errors.impact ? errorFieldClass : ''}`}
          >
            {RISK_SCALE_VALUES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <FieldError id="impact-error" message={errors.impact} />
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Nivel calculado</span>
          <div className="flex h-[38px] items-center rounded-md border border-slate-200 bg-slate-50 px-3">
            <RiskLevelBadge level={level} score={score} />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
          Estado <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          name="status"
          value={values.status}
          onChange={(e) => setField('status', e.target.value as RiskStatus)}
          className={`${fieldClass} ${errors.status ? errorFieldClass : ''}`}
        >
          {RISK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <FieldError id="status-error" message={errors.status} />
      </div>

      <div>
        <label htmlFor="mitigationPlan" className="mb-1 block text-sm font-medium text-slate-700">
          Plan de mitigación
        </label>
        <textarea
          id="mitigationPlan"
          name="mitigationPlan"
          rows={3}
          value={values.mitigationPlan}
          onChange={(e) => setField('mitigationPlan', e.target.value)}
          className={fieldClass}
        />
      </div>

      {submitError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
