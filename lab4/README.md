# Lab 4 — Cipher and Decipher

Formulario web que cifra y descifra texto con AES usando `crypto-js`, siguiendo
el material de la sesión *Hash-Cipher-Decipher* (TC3005B).

## Requisitos del lab

| # | Requisito | Dónde está |
| --- | --- | --- |
| 1 | Formulario | `<form className="card">` en `src/App.jsx` |
| 2 | Caja de texto para el texto plano | `<textarea>` ligado a `textoPlano` |
| 3 | Botón para cifrar | botón *Cifrar* (`type="submit"`) |
| 4 | Párrafo con el texto cifrado | `<p>` bajo *Texto cifrado* |
| 5 | Botón para descifrar | botón *Descifrar* |
| 6 | Párrafo con el texto original | `<p>` bajo *Texto original* |

Como extra se muestra el hash SHA-512 del texto con pimienta, para contrastar el
cifrado (reversible) contra el hashing (unidireccional).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite. No hace falta configurar nada.

## Variables de entorno

Opcionales. Copia `.env.example` a `.env` si quieres cambiar la pimienta:

```
VITE_APP_PEPPER=
```

> **Nota sobre seguridad.** Todo el cifrado corre en el navegador, así que la
> llave tiene que estar ahí para poder descifrar. Vite escribe las variables
> `VITE_*` literalmente dentro del bundle que sirve al cliente, de modo que un
> `.env` aquí documenta el valor, no lo esconde. En un sistema real el cifrado y
> la llave viven en el servidor.

## Estructura

```
src/
  crypto.js   funciones cifrar / descifrar / hashear
  App.jsx     formulario y estado
  App.css     estilos del formulario y los resultados
  index.css   tokens de diseño (tema oscuro por defecto, claro según el sistema)
```

## Stack

React 19 · Vite · crypto-js · oxlint
