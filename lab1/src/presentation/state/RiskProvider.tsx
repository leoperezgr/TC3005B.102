import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { container as defaultContainer, type Container } from '../../di/container';

const ContainerContext = createContext<Container>(defaultContainer);

/**
 * Inyecta el contenedor en el árbol de React. Los componentes nunca importan
 * repositorios ni localStorage: solo consumen casos de uso desde aquí.
 */
export function RiskProvider({
  children,
  container = defaultContainer,
}: {
  children: ReactNode;
  container?: Container;
}) {
  const value = useMemo(() => container, [container]);
  return <ContainerContext.Provider value={value}>{children}</ContainerContext.Provider>;
}

export function useContainer(): Container {
  return useContext(ContainerContext);
}

export function useUseCases() {
  return useContainer().useCases;
}
