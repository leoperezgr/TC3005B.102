import {
  RISK_CATEGORIES,
  RISK_STATUSES,
  type RiskInput,
} from './Risk';
import {
  DESCRIPTION_MAX_LENGTH,
  SCALE_MAX,
  SCALE_MIN,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  normalizeRiskInput,
} from './riskRules';

/** Errores por campo; vacío significa entrada válida. */
export type RiskValidationErrors = Partial<Record<keyof RiskInput, string>>;

export interface RiskValidationResult {
  valid: boolean;
  errors: RiskValidationErrors;
}

function isIntegerInScale(value: number): boolean {
  return Number.isInteger(value) && value >= SCALE_MIN && value <= SCALE_MAX;
}

/** Valida un riesgo según las reglas de negocio. Único lugar donde viven. */
export function validateRisk(input: RiskInput): RiskValidationResult {
  const { title, description, category, probability, impact, owner, status } =
    normalizeRiskInput(input);
  const errors: RiskValidationErrors = {};

  if (!title) {
    errors.title = 'El título es obligatorio.';
  } else if (title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH) {
    errors.title = `El título debe tener entre ${TITLE_MIN_LENGTH} y ${TITLE_MAX_LENGTH} caracteres.`;
  }

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `La descripción no puede exceder ${DESCRIPTION_MAX_LENGTH} caracteres.`;
  }

  if (!RISK_CATEGORIES.includes(category)) {
    errors.category = 'Selecciona una categoría válida.';
  }

  if (!isIntegerInScale(probability)) {
    errors.probability = `La probabilidad debe ser un entero entre ${SCALE_MIN} y ${SCALE_MAX}.`;
  }

  if (!isIntegerInScale(impact)) {
    errors.impact = `El impacto debe ser un entero entre ${SCALE_MIN} y ${SCALE_MAX}.`;
  }

  if (!owner) {
    errors.owner = 'El responsable es obligatorio.';
  }

  if (!RISK_STATUSES.includes(status)) {
    errors.status = 'Selecciona un estado válido.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Error de dominio lanzado por los casos de uso ante entrada inválida. */
export class RiskValidationError extends Error {
  constructor(public readonly errors: RiskValidationErrors) {
    super('El riesgo no cumple las reglas de validación.');
    this.name = 'RiskValidationError';
  }
}

/** Error de dominio para un riesgo inexistente. */
export class RiskNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`No existe un riesgo con id "${id}".`);
    this.name = 'RiskNotFoundError';
  }
}
