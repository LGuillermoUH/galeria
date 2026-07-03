# Gallery

Galería de imágenes con página privada de subida/borrado protegida por secret.
Reescrita de Astro a **React + Bun** (sin Astro).

## Stack

- **Bun** — runtime, servidor HTTP (`Bun.serve`) y bundler. Sin Vite/Webpack:
  Bun importa los `.html` directamente y bundlea el React/TSX referenciado.
- **React 19** — dos entradas SPA independientes, sin router (solo dos páginas).
- Sin base de datos: las imágenes son archivos en `public/images/`.

## Estructura

```
server.ts          Bun.serve: rutas de página + API + servir /images/:file
src/
  index.html        entrada "/"        -> main.tsx        -> Gallery.tsx
  private.html       entrada "/private" -> private-main.tsx -> Private.tsx
  styles.css        estilos compartidos (grid brutalista, modal, form privado)
public/
  images/           archivos de la galería (gitignored)
  private/          carpeta suelta sin uso en el código
```

## API

| Ruta                     | Método | Auth              | Qué hace                          |
|---------------------------|--------|-------------------|------------------------------------|
| `/api/images`              | GET    | —                 | lista pública de imágenes         |
| `/api/private/images`      | GET    | `?secret=`        | lista de imágenes (para gestión)  |
| `/api/private/upload`      | POST   | form `secret`     | sube uno o más archivos           |
| `/api/private/delete`      | POST   | form `secret`     | borra un archivo                  |
| `/images/:file`             | GET    | —                 | sirve el archivo con cache-control |

El secret se valida contra `process.env.UPLOAD_SECRET` (`.env`, no versionado).

## Comandos

```
bun install
bun run dev     # servidor con hot reload
bun run start   # producción
```

## Docker

Un solo stage: `bun install --production` + `bun run start`. Bun bundlea
el frontend on-the-fly al servir cada página, no hay paso de `build` aparte.

## Qué cambió respecto a la versión Astro

- `src/pages/*.astro` → componentes React (`Gallery.tsx`, `Private.tsx`).
- El flujo de subida/borrado con redirect de formulario → `fetch` + refetch
  de la lista en el cliente.
- `src/pages/images/[file].ts` (API route de Astro) → ruta `/images/:file`
  en `server.ts`.
- `astro.config.mjs`, `.astro/`, adapter de Node → eliminados; Bun sirve
  todo directamente.
