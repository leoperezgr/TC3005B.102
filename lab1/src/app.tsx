import { BrowserRouter, Link } from 'react-router-dom';
import { AppRouter } from './presentation/navigation/AppRouter';
import { RiskProvider } from './presentation/state/RiskProvider';

export function App() {
  return (
    <RiskProvider>
      {/* future flags: adopta desde ya el comportamiento de React Router v7 */}
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <div className="min-h-screen bg-slate-50">
          <nav className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
              <Link to="/" className="text-sm font-semibold tracking-tight text-slate-900">
                Matriz de Riesgos · Auditoría
              </Link>
              <Link
                to="/risks/new"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                + Nuevo
              </Link>
            </div>
          </nav>
          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            <AppRouter />
          </main>
        </div>
      </BrowserRouter>
    </RiskProvider>
  );
}

export default App;
