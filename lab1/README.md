# Tabla de Riesgos de Auditoría

Aplicación web **CRUD** para registrar, evaluar y dar seguimiento a los riesgos
identificados en un proceso de auditoría. Construida con **React + TypeScript**
aplicando **Clean Architecture**: las reglas de negocio viven aisladas en la capa
de dominio y la persistencia es intercambiable sin tocar el resto del código.

## Stack

| Área | Tecnología |
|---|---|
| UI | React 18 + TypeScript |
| Bundler | Vite 5 |
| Estilos | Tailwind CSS 3 |
| Navegación | React Router 6 |
| Pruebas | Vitest + React Testing Library + jsdom |
| Persistencia | `localStorage` detrás de la interfaz `RiskRepository` |

## Características

- **Listado** en tabla con título, categoría, probabilidad, impacto, nivel
  (badge verde / amarillo / rojo), responsable, estado y acciones.
- **Alta** de riesgos con formulario validado y mensajes de error por campo.
- **Detalle** de cada riesgo con todos sus campos y fechas.
- **Edición** reutilizando el mismo formulario.
- **Eliminación** con diálogo de confirmación (cierra con `Esc`).
- **Búsqueda** por título o responsable y **filtros** por categoría, nivel y estado.
- **Ordenamiento** por nivel de riesgo o por fecha de creación.
- **Resumen** superior con el total y el conteo por nivel (Alto / Medio / Bajo).
- **Carga inicial** de 5 riesgos de ejemplo si `localStorage` está vacío.
- Diseño **responsivo** y estados de carga, error y vacío bien diferenciados.

## Modelo de dominio

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | string (UUID) | generado automáticamente |
| `title` | string | obligatorio, 3–100 caracteres |
| `description` | string | opcional, máx. 500 caracteres |
| `category` | enum | `Operativo`, `Financiero`, `Tecnológico`, `Legal`, `Reputacional` |
| `probability` | number | entero de 1 a 5 |
| `impact` | number | entero de 1 a 5 |
| `score` | number (calculado) | `probability × impact` |
| `level` | enum (calculado) | 1–6 `Bajo`, 7–14 `Medio`, 15–25 `Alto` |
| `owner` | string | obligatorio |
| `status` | enum | `Abierto`, `En mitigación`, `Cerrado` |
| `mitigationPlan` | string | opcional |
| `createdAt` / `updatedAt` | ISO date | automáticos |

El cálculo de `score`/`level` (`src/domain/entities/riskRules.ts`) y todas las
validaciones (`src/domain/entities/riskValidation.ts`) viven **solo** en el
dominio. Los componentes no replican ninguna regla.

## Requisitos previos

- **Node.js 18 o superior** (probado con Node 24)
- npm 9+

## Instalación y uso

```bash
npm install     # instala dependencias
npm run dev     # servidor de desarrollo → http://localhost:5173
npm run build   # verificación de tipos + build de producción en dist/
npm run preview # sirve el build de producción
npm run test    # ejecuta la suite completa una vez
npm run test:watch  # pruebas en modo watch
npm run lint    # solo verificación de tipos (tsc --noEmit)
```

## Estructura de carpetas por capa

```
src/
├── domain/                 # Núcleo: no importa NADA de las otras capas
│   ├── entities/           # Risk, enums, calculateRiskLevel, validateRisk
│   ├── repositories/       # RiskRepository (interfaz, sin implementación)
│   └── useCases/           # GetRisks, GetRiskById, CreateRisk, UpdateRisk, DeleteRisk
├── data/                   # Implementa los contratos del dominio
│   ├── repositories/       # RiskRepositoryImpl
│   ├── sources/            # RiskDataSource + LocalStorageRiskDataSource
│   └── seed/               # 5 riesgos de ejemplo
├── infrastructure/         # Detalles técnicos externos
│   ├── api/                # HttpClient (placeholder para la futura API REST)
│   └── storage/            # LocalStorageWrapper, InMemoryStorage, generateId
├── presentation/           # Todo lo que ve el usuario
│   ├── components/         # RiskTable, RiskForm, RiskLevelBadge, ConfirmDialog, Filters…
│   ├── screens/            # RiskListScreen, RiskFormScreen, RiskDetailScreen
│   ├── navigation/         # AppRouter (definición de rutas)
│   └── state/              # useRisks, useRisk, RiskProvider (adaptadores a casos de uso)
├── di/                     # container.ts: instancia repositorios y casos de uso
├── test/                   # setup, InMemoryRiskRepository, factories
└── app.tsx                 # Layout raíz + router
```

### Regla de dependencias

```
presentation ──▶ di ──▶ useCases ──▶ RiskRepository (interfaz)
                                            ▲
                          data ─────────────┘──▶ infrastructure
```

- `domain` **no importa** nada de `data`, `infrastructure` ni `presentation`.
- Los componentes **nunca** usan `localStorage`; solo llaman a hooks de
  `presentation/state`, que a su vez ejecutan casos de uso.
- Cada caso de uso es una clase con un único método `execute()` que recibe el
  repositorio por constructor.

### Cambiar `localStorage` por una API REST

1. Crear `src/data/sources/HttpRiskDataSource.ts` implementando `RiskDataSource`
   con el `HttpClient` de `src/infrastructure/api/HttpRiskApi.ts`.
2. Cambiar **una línea** en `src/di/container.ts`:

```ts
const dataSource = new HttpRiskDataSource(new HttpClient({ baseUrl: '/api' }));
```

Ni el dominio ni la presentación requieren cambio alguno.

## Rutas

| Ruta | Pantalla |
|---|---|
| `/` | Listado con resumen, filtros y tabla |
| `/risks/new` | Alta de riesgo |
| `/risks/:id` | Detalle |
| `/risks/:id/edit` | Edición |
| `*` | Página no encontrada |

## Pruebas

```bash
npm run test
```

| Archivo | Qué cubre |
|---|---|
| `domain/entities/riskRules.test.ts` | `calculateScore`, `calculateRiskLevel` (incluidos los límites 6/7 y 14/15), normalización y derivados |
| `domain/entities/riskValidation.test.ts` | Todas las reglas de validación por campo |
| `domain/useCases/useCases.test.ts` | Los 5 casos de uso contra un `InMemoryRiskRepository` |
| `data/repositories/RiskRepositoryImpl.test.ts` | Persistencia, carga inicial de ejemplos y CRUD |
| `presentation/components/RiskForm.test.tsx` | Errores por campo, envío válido y nivel calculado en vivo |

## Datos

Los riesgos se guardan en `localStorage` bajo la clave `auditoria.risks.v1`.
Para reiniciar la aplicación con los 5 ejemplos, borra esa clave desde las
DevTools del navegador y recarga.
