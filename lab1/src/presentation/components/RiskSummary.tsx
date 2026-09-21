import type { RiskSummaryCounts } from '../state/riskFilters';

const CARDS: { key: keyof RiskSummaryCounts; label: string; className: string }[] = [
  { key: 'total', label: 'Total de riesgos', className: 'bg-white text-slate-900' },
  { key: 'alto', label: 'Nivel Alto', className: 'bg-red-50 text-red-800' },
  { key: 'medio', label: 'Nivel Medio', className: 'bg-yellow-50 text-yellow-800' },
  { key: 'bajo', label: 'Nivel Bajo', className: 'bg-green-50 text-green-800' },
];

export function RiskSummary({ summary }: { summary: RiskSummaryCounts }) {
  return (
    <section aria-label="Resumen de riesgos" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CARDS.map(({ key, label, className }) => (
        <div key={key} className={`rounded-lg border border-slate-200 p-4 shadow-sm ${className}`}>
          <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{summary[key]}</p>
        </div>
      ))}
    </section>
  );
}
