import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { RiskDetailScreen } from '../screens/RiskDetailScreen';
import { RiskFormScreen } from '../screens/RiskFormScreen';
import { RiskListScreen } from '../screens/RiskListScreen';

function NotFoundScreen() {
  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-2xl font-bold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-sm text-slate-500">La ruta solicitada no existe.</p>
      <Link
        to="/"
        className="mt-4 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Ir al listado
      </Link>
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RiskListScreen />} />
      <Route path="/risks" element={<Navigate to="/" replace />} />
      <Route path="/risks/new" element={<RiskFormScreen />} />
      <Route path="/risks/:id" element={<RiskDetailScreen />} />
      <Route path="/risks/:id/edit" element={<RiskFormScreen />} />
      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  );
}
