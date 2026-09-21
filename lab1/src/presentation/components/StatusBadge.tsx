import { RiskStatus } from '../../domain/entities/Risk';

const STYLES: Record<RiskStatus, string> = {
  [RiskStatus.Abierto]: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  [RiskStatus.EnMitigacion]: 'bg-blue-100 text-blue-800 ring-blue-600/20',
  [RiskStatus.Cerrado]: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
};

export function StatusBadge({ status }: { status: RiskStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
