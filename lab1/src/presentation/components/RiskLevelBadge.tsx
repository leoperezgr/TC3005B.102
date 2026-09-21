import { RiskLevel } from '../../domain/entities/Risk';

const STYLES: Record<RiskLevel, string> = {
  [RiskLevel.Bajo]: 'bg-green-100 text-green-800 ring-green-600/20',
  [RiskLevel.Medio]: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
  [RiskLevel.Alto]: 'bg-red-100 text-red-800 ring-red-600/20',
};

export function RiskLevelBadge({ level, score }: { level: RiskLevel; score?: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STYLES[level]}`}
    >
      {level}
      {score !== undefined && <span className="font-normal opacity-70">({score})</span>}
    </span>
  );
}
