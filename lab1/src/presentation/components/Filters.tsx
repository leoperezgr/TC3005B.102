import {
  RISK_CATEGORIES,
  RISK_LEVELS,
  RISK_STATUSES,
  type RiskCategory,
  type RiskLevel,
  type RiskStatus,
} from '../../domain/entities/Risk';
import {
  SORT_OPTIONS,
  type RiskFiltersState,
  type SortKey,
} from '../state/riskFilters';

const selectClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500';

export function Filters({
  filters,
  onChange,
  sort,
  onSortChange,
  onReset,
}: {
  filters: RiskFiltersState;
  onChange: (filters: RiskFiltersState) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  onReset: () => void;
}) {
  return (
    <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
      <div className="sm:col-span-2 lg:col-span-1">
        <label htmlFor="search" className="mb-1 block text-xs font-medium text-slate-600">
          Buscar
        </label>
        <input
          id="search"
          type="search"
          placeholder="Título o responsable"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className={selectClass}
        />
      </div>

      <div>
        <label htmlFor="filter-category" className="mb-1 block text-xs font-medium text-slate-600">
          Categoría
        </label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) =>
            onChange({ ...filters, category: e.target.value as RiskCategory | 'all' })
          }
          className={selectClass}
        >
          <option value="all">Todas</option>
          {RISK_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-level" className="mb-1 block text-xs font-medium text-slate-600">
          Nivel
        </label>
        <select
          id="filter-level"
          value={filters.level}
          onChange={(e) => onChange({ ...filters, level: e.target.value as RiskLevel | 'all' })}
          className={selectClass}
        >
          <option value="all">Todos</option>
          {RISK_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-status" className="mb-1 block text-xs font-medium text-slate-600">
          Estado
        </label>
        <select
          id="filter-status"
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as RiskStatus | 'all' })}
          className={selectClass}
        >
          <option value="all">Todos</option>
          {RISK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sort" className="mb-1 block text-xs font-medium text-slate-600">
          Ordenar por
        </label>
        <div className="flex gap-2">
          <select
            id="sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className={selectClass}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onReset}
            title="Limpiar filtros"
            className="shrink-0 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Limpiar
          </button>
        </div>
      </div>
    </section>
  );
}
