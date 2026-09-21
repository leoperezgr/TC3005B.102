/**
 * Wrapper sobre localStorage. Aísla el acceso al Web Storage API para que
 * ninguna otra capa lo toque directamente y para poder sustituirlo en tests
 * o en entornos sin `window`.
 */
export interface KeyValueStorage {
  read<T>(key: string): T | null;
  write<T>(key: string, value: T): void;
  remove(key: string): void;
}

export class StorageError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}

export class LocalStorageWrapper implements KeyValueStorage {
  constructor(private readonly storage: Storage = window.localStorage) {}

  read<T>(key: string): T | null {
    try {
      const raw = this.storage.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch (cause) {
      throw new StorageError(`No se pudo leer la clave "${key}".`, cause);
    }
  }

  write<T>(key: string, value: T): void {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (cause) {
      throw new StorageError(`No se pudo guardar la clave "${key}".`, cause);
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (cause) {
      throw new StorageError(`No se pudo borrar la clave "${key}".`, cause);
    }
  }
}

/** Implementación en memoria, útil para tests y SSR. */
export class InMemoryStorage implements KeyValueStorage {
  private readonly map = new Map<string, string>();

  read<T>(key: string): T | null {
    const raw = this.map.get(key);
    return raw === undefined ? null : (JSON.parse(raw) as T);
  }

  write<T>(key: string, value: T): void {
    this.map.set(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.map.delete(key);
  }
}
