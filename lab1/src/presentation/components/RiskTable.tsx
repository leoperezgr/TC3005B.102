import { Link } from 'react-router-dom';
import type { Risk } from '../../domain/entities/Risk';
import { RiskLevelBadge } from './RiskLevelBadge';
import { StatusBadge } from './StatusBadge';

const th = 'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600';
const td = 'px-3 py-3 text-sm text-slate-700 align-middle';

export function RiskTable({
  risks,
  onDelete,
}: {
  risks: Risk[];
  onDelete: (risk: Risk) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <caption className="sr-only">Tabla de riesgos de auditoría</caption>
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className={th}>Título</th>
            <th scope="col" className={th}>Categoría</th>
            <th scope="col" className={`${th} text-center`}>Prob.</th>
            <th scope="col" className={`${th} text-center`}>Impacto</th>
            <th scope="col" className={th}>Nivel</th>
            <th scope="col" className={th}>Responsable</th>
            <th scope="col" className={th}>Estado</th>
            <th scope="col" className={`${th} text-right`}>Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {risks.map((risk) => (
            <tr key={risk.id} className="hover:bg-slate-50">
              <td className={`${td} font-medium text-slate-900`}>
                <Link to={`/risks/${risk.id}`} className="hover:underline">
                  {risk.title}
                </Link>
              </td>
              <td className={td}>{risk.category}</td>
              <td className={`${td} text-center tabular-nums`}>{risk.probability}</td>
              <td className={`${td} text-center tabular-nums`}>{risk.impact}</td>
              <td className={td}>
                <RiskLevelBadge level={risk.level} score={risk.score} />
              </td>
              <td className={td}>{risk.owner}</td>
              <td className={td}>
                <StatusBadge status={risk.status} />
              </td>
              <td className={`${td} text-right whitespace-nowrap`}>
                <Link
                  to={`/risks/${risk.id}`}
                  className="rounded px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Ver
                </Link>
                <Link
                  to={`/risks/${risk.id}/edit`}
                  className="rounded px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(risk)}
                  aria-label={`Eliminar ${risk.title}`}
                  className="rounded px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
