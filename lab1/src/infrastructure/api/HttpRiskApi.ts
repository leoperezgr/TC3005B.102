/**
 * Placeholder para la futura API REST.
 *
 * Cuando exista backend, basta con implementar `RiskDataSource` aquí
 * (p. ej. `HttpRiskDataSource`) y cambiar una línea en `src/di/container.ts`.
 * Ni el dominio ni la presentación se enteran del cambio.
 */
export interface HttpClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

export class HttpClient {
  constructor(private readonly config: HttpClientConfig) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.config.baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...init.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} en ${path}`);
    }

    return (await response.json()) as T;
  }
}
