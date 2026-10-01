# Lab2 · Firebase CRUD Catálogo de Empleados

CRUD del catálogo de **empleados** construido con **Next.js (App Router) + TypeScript
+ Tailwind CSS** y persistencia en **Firebase Cloud Firestore**.

## Funciones (app/page.tsx)

Igual que en la presentación: un solo campo de texto, botón **Agregar** y lista con
botones **Edit** (usa `prompt`) y **Delete**.

| Operación | Función | API de Firestore |
|---|---|---|
| Agregar | `handleAdd` | `addDoc` |
| Consultar | `fetchEmpleados` | `getDocs` |
| Editar | `handleEdit` | `updateDoc` |
| Eliminar | `handleDelete` | `deleteDoc` |

## Modelo (colección `empleados`)

| Campo | Tipo |
|---|---|
| `nombre` | string |

## Configuración de Firebase

1. Entra a <https://console.firebase.google.com/> y crea un proyecto.
2. **Agregar app → Web (`</>`)** y copia el objeto `firebaseConfig`.
3. En **Firestore Database → Crear base de datos** (modo de prueba para el lab).
4. Copia las variables de entorno y llénalas con los valores de `firebaseConfig`:

   ```bash
   cp .env.example .env.local
   ```

> En modo de prueba las reglas permiten lectura/escritura sin autenticación por 30
> días. Para el lab basta con:
>
> ```
> rules_version = '2';
> service cloud.firestore {
>   match /databases/{database}/documents {
>     match /empleados/{id} { allow read, write: if true; }
>   }
> }
> ```

## Uso

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de producción
npm run lint
```

## Estructura

```
app/
├── layout.tsx
└── page.tsx                 # UI y funciones CRUD (Add, Edit, Delete, Fetch)
firebase/
└── firebase.config.ts       # Inicialización de Firebase y export de `db`
```
