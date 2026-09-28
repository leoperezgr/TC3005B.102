# Estimador de Software: COCOMO, COSMIC y Puntos de Función

**Materia:** TC3005B · Actividad de Estimación (Semana 1, Modelos de Estimación)

Aplicación web de una sola página (`index.html`, HTML + CSS + JavaScript sin dependencias) que estima el tamaño, esfuerzo, tiempo y personal de un proyecto de software con los tres modelos vistos en clase:

| Modelo | Entrada | Salida |
|---|---|---|
| **COCOMO 81** (básico e intermedio) | Tamaño en KLOC, modo de desarrollo y, en el intermedio, los 15 *cost drivers* | Esfuerzo E (persona-mes), tiempo D (meses), personal P, productividad y costo |
| **COSMIC** (ISO/IEC 19761) | Movimientos de datos E, X, R y W por proceso funcional | Tamaño en CFP y esfuerzo con una tasa de horas-persona/CFP |
| **Puntos de Función** (IFPUG CPM 4.3.1) | EI, EO, EQ, ILF y EIF por complejidad, y las 14 características (TDI) | UFP, VAF, PFA y su conversión a KLOC para alimentar COCOMO |

## Cómo usarla

1. Abre `index.html` en cualquier navegador. También funciona publicada con GitHub Pages (Settings → Pages → rama `main`, carpeta raíz).
2. Pestaña **COCOMO**: captura los KLOC, elige el nivel (básico o intermedio) y el modo (orgánico, semi-acoplado o empotrado). El panel derecho muestra el resultado y el desarrollo de cada fórmula.
3. Pestaña **COSMIC**: agrega procesos funcionales y cuenta sus movimientos de datos.
4. Pestaña **Puntos de Función**: captura los componentes y el TDI. El botón *Usar este tamaño en COCOMO* convierte los PFA a KLOC y los pasa a COCOMO.
5. Pestaña **Ejercicios de clase**: compara los resultados de la aplicación con los ejemplos y ejercicios de la presentación.

## Fórmulas implementadas

### COCOMO

```
E = a × KLOC^b           (persona-mes)    ; intermedio: E = a × KLOC^b × EAF
D = c × E^d              (meses)
P = E / D                (personas)
```

| Modo | a (básico) | a (intermedio) | b | c | d |
|---|---|---|---|---|---|
| Orgánico | 2.4 | 3.2 | 1.05 | 2.5 | 0.38 |
| Semi-acoplado | 3.0 | 3.0 | 1.12 | 2.5 | 0.35 |
| Empotrado | 3.6 | 2.8 | 1.20 | 2.5 | 0.32 |

EAF es el producto de los 15 multiplicadores de Boehm (RELY, DATA, CPLX, TIME, STOR, VIRT, TURN, ACAP, AEXP, PCAP, VEXP, LEXP, MODP, TOOL, SCED).

### COSMIC

```
Tamaño (CFP) = ΣE + ΣX + ΣR + ΣW        (cada movimiento = 1 CFP)
Esfuerzo     = CFP × tasa (horas-persona/CFP)
```

### Puntos de Función

```
UFP = Σ (cantidad × peso)
VAF = 0.65 + 0.01 × TDI       (TDI = suma de 14 características, 0–70)
PFA = UFP × VAF
KLOC = PFA × (LOC por PF) / 1000
```

| Componente | Baja | Media | Alta |
|---|---|---|---|
| EI | 3 | 4 | 6 |
| EO | 4 | 5 | 7 |
| EQ | 3 | 4 | 6 |
| ILF | 7 | 10 | 15 |
| EIF | 5 | 7 | 10 |

---

## Estimación por COCOMO: Sistema web de control escolar

### Descripción del proyecto

Una aplicación web para una escuela preparatoria. Los profesores registran calificaciones, los alumnos consultan su boleta y control escolar administra alumnos, grupos y materias. El equipo es pequeño y con experiencia en este tipo de sistemas, y el problema es conocido, así que el modo de desarrollo es **orgánico**.

### 1. Tamaño con Puntos de Función

| Componente | Baja | Media | Alta | Subtotal |
|---|---|---|---|---|
| EI (altas de alumnos, calificaciones, grupos…) | 6 × 3 | 4 × 4 | 1 × 6 | 40 |
| EO (boletas, reportes de grupo…) | 5 × 4 | 3 × 5 | 1 × 7 | 42 |
| EQ (consultas de alumno, horario…) | 4 × 3 | 2 × 4 | 0 × 6 | 20 |
| ILF (alumnos, calificaciones, grupos…) | 3 × 7 | 3 × 10 | 1 × 15 | 66 |
| EIF (catálogo de materias, SSO institucional) | 2 × 5 | 1 × 7 | 0 × 10 | 17 |
| **UFP** | | | | **185** |

- TDI = 41, así que VAF = 0.65 + 0.01 × 41 = **1.06**
- PFA = 185 × 1.06 = **196.1 PF**
- Backend en Java, a 53 LOC/PF: 196.1 × 53 / 1000 = **10.39 KLOC**

### 2. COCOMO básico (orgánico: a = 2.4, b = 1.05, c = 2.5, d = 0.38)

```
E = 2.4 × 10.39^1.05 = 28.03 persona-mes
D = 2.5 × 28.03^0.38 = 8.87 meses
P = 28.03 / 8.87     = 3.16 ≈ 3 personas
```

Con un costo de $35,000 MXN por persona-mes, el costo estimado es de **$981,128 MXN**.

### 3. COCOMO intermedio (orgánico: a = 3.2)

| Cost driver | Nivel | Multiplicador | Justificación |
|---|---|---|---|
| RELY | Alto | 1.15 | Las calificaciones son datos oficiales |
| DATA | Alto | 1.08 | Historial de varias generaciones |
| ACAP | Alto | 0.86 | Analistas con experiencia |
| PCAP | Alto | 0.86 | Programadores con experiencia |
| LEXP | Bajo | 1.07 | Parte del equipo es nueva en Java |
| MODP | Alto | 0.91 | Se usan prácticas modernas (Git, revisiones, pruebas) |
| Resto | Nominal | 1.00 | |

```
E nominal = 3.2 × 10.39^1.05 = 37.38 persona-mes
EAF       = 1.15 × 1.08 × 0.86 × 0.86 × 1.07 × 0.91 = 0.8944
E         = 37.38 × 0.8944 = 33.43 persona-mes
D         = 2.5 × 33.43^0.38 = 9.49 meses
P         = 33.43 / 9.49 = 3.52 ≈ 4 personas
```

### Resumen

| Modelo | Esfuerzo (PM) | Tiempo (meses) | Personal |
|---|---|---|---|
| COCOMO básico | 28.0 | 8.9 | 3.2 |
| COCOMO intermedio | 33.4 | 9.5 | 3.5 |

El modelo intermedio da unas 5 persona-mes más porque la fiabilidad requerida, el tamaño de la base de datos y la poca experiencia en el lenguaje pesan más que la capacidad del equipo.

---

## Comprobación con el material de clase

Todos los casos de la presentación dan el mismo resultado en la aplicación (pestaña *Ejercicios de clase*).

| Caso | Material | Aplicación |
|---|---|---|
| Ejemplo COCOMO: orgánico, 30 KLOC | E ≈ 85.4 PM, D ≈ 13.6 meses, P ≈ 6 | E = 85.35 PM, D = 13.55 meses, P = 6.30 |
| Ejemplo COSMIC: "Iniciar sesión" | 4 CFP, 32 horas-persona | 4 CFP, 32 horas-persona |
| Ejemplo FP: complejidad media, TDI = 35 | UFP = 53, VAF = 1.00, 53 PF | UFP = 53, VAF = 1.00, 53 PF |

### Ejercicios propuestos

**Ejercicio 1.** Proyecto semi-acoplado de 50 KLOC con COCOMO básico (a = 3.0, b = 1.12, c = 2.5, d = 0.35).

```
E = 3.0 × 50^1.12    = 239.87 persona-mes
D = 2.5 × 239.87^0.35 = 17.02 meses
P = 239.87 / 17.02    = 14.09 ≈ 14 personas
```

**Ejercicio 2.** COSMIC, proceso "Registrar una nueva calificación".

| Movimiento | Tipo | CFP |
|---|---|---|
| El profesor captura matrícula, materia y calificación | E | 1 |
| El sistema lee la inscripción del alumno en el grupo | R | 1 |
| El sistema guarda la calificación | W | 1 |
| El sistema muestra la confirmación al profesor | X | 1 |
| **Total** | | **4 CFP** |

A 8 horas-persona/CFP, son 32 horas-persona. Si además se lee la materia como un grupo de datos aparte, se agrega una R y el total es 5 CFP.

**Ejercicio 3.** 4 EI, 3 EO, 2 EQ, 3 ILF y 1 EIF, todos de complejidad media.

```
UFP = 4×4 + 3×5 + 2×4 + 3×10 + 1×7 = 16 + 15 + 8 + 30 + 7 = 76
```

**Ejercicio 4.** Comparación de modelos. COCOMO es el más rápido de aplicar cuando ya se conoce el tamaño en KLOC, pero al inicio de un proyecto ese dato no existe y hay que estimarlo, por ejemplo con Puntos de Función. COSMIC y Puntos de Función se pueden aplicar desde los requisitos. COSMIC fue el más sencillo con la información disponible, porque solo cuenta movimientos de datos sin clasificar complejidades ni calcular un factor de ajuste. Puntos de Función requiere juzgar la complejidad de cada componente y las 14 características, pero su resultado se convierte a KLOC y permite usar COCOMO.

## Referencias

- Boehm, B. W. (1981). *Software Engineering Economics*. Prentice-Hall.
- The COSMIC Functional Size Measurement Method, *Measurement Manual* v4.0.2.
- International Function Point Users Group (IFPUG). *Counting Practices Manual*, release 4.3.1.
- Pressman, R. S., & Maxim, B. R. (2015). *Ingeniería del software: un enfoque práctico* (8a ed.). McGraw-Hill.
