# upds-games

App de feria: 4 juegos, cada uno estimula un lóbulo distinto. Participante registra apodo, ve cerebro gris que se colorea por lóbulo al completar cada juego.

## Stack

- **Next.js 16** (App Router), full-stack (pages + Route Handlers, sin backend separado)
- **SQLite + Prisma 7** — requiere driver adapter (`@prisma/adapter-better-sqlite3` + `better-sqlite3`)
- **shadcn/ui + Tailwind v4** (mobile-first)
- **`qrcode`** para QR de sync

## Prisma 7

- `DATABASE_URL` se configura en `.env`, **no** en `schema.prisma` (el datasource `url` se eliminó del schema)
- `prisma.config.ts` usa `defineConfig` con `datasource.url` desde `process.env`
- El cliente generado está en `src/generated/prisma/client.ts` (importar desde ahí, no de `@prisma/client`)
- `PrismaClient` requiere `{ adapter }` — se usa `PrismaBetterSqlite3` de `@prisma/adapter-better-sqlite3`
- Seed: `npx tsx prisma/seed.ts`

## Auth

- **Participante**: cookie `userId` (plano, sin JWT, sin password)
- **Admin**: cookie httpOnly `admin_token=authenticated`, credenciales contra `ADMIN_USER`/`ADMIN_PASSWORD` en `.env`, sin BD
- Valores por defecto: `ADMIN_USER=admin`, `ADMIN_PASSWORD=contraUPDS2026`

## Rutas

| Ruta | Tipo | Qué hace |
|---|---|---|
| `/` | Page (client) | Registro de apodo |
| `/mi-cerebro` | Page (server) | Cerebro gris + overlays + PDFs |
| `/sync/[token]` | Page (server) | Valida token, marca completado, setea cookie, redirect |
| `/admin` | Page (client) | Login admin |
| `/admin/panel` | Page (client) | Busca apodo, marca juego, muestra QR |
| `POST /api/registro` | Route | Crea `User`, setea cookie `userId` |
| `POST /api/admin/login` | Route | Valida credenciales, setea cookie admin |
| `POST /api/admin/marcar-completado` | Route | Upsert `Progreso`, genera `syncToken` + QR |
| `GET /api/admin/buscar-participante` | Route | Busca user por apodo |
| `GET /api/admin/panel-data` | Route | Lista juegos para panel |
| `GET /api/sync/[token]` | Route | Valida token, marca `completadoAt`, redirect con cookie |

## Sync token flow

1. Admin marca completado → backend genera UUID + expira 3 min, muestra QR
2. QR apunta a `/sync/[token]` (server page)
3. Participante escanea → page valida token vs cookie, marca `completadoAt`, invalida token, redirect a `/mi-cerebro`
4. Token se invalida tras primer uso o al expirar

## Juegos (seed data)

| Juego | Lóbulo | Descripción (placeholder) |
|---|---|---|
| Color contrario | Frontal | Stroop: palabra de color en tinta distinta |
| Adivina la emoción de la música | Temporal | Identificar emoción en música |
| Relieve Express | Parietal | Reconocimiento táctil |
| El dilema del puente | Occipital | Acertijo visual |

## Brain overlay

6 PNGs en `/public/`, mismo tamaño, superpuestos con `position: absolute`:

| Archivo | Cuándo |
|---|---|
| `cerebro-gris.png` | Siempre (base) |
| `lobulo-frontal.png` | Si `Progreso.completadoAt` existe |
| `lobulo-parietal.png` | Ídem |
| `lobulo-temporal.png` | Ídem |
| `lobulo-occipital.png` | Ídem |

Colores en los PNG, no en código. Placeholders incluidos (1x1 colored).

## PDFs

Placeholders en `/public/pdfs/juego-{lóbulo}.pdf`.

## Comandos

```sh
npm run dev      # dev server
npm run build    # build + typecheck
npm run lint     # ESLint
npx tsx prisma/seed.ts  # seed juegos
npx prisma studio       # Prisma Studio (CLI)
```

## Code conventions

- Máximo ~500 líneas por archivo
- Sin comentarios en código
- Sin estilos custom fuera de shadcn/Tailwind
- Sin capas ni abstracciones extra
- `"use client"` solo donde se necesita interactividad
- `<img>` en lugar de `<Image>` para overlays dinámicos

## Pendiente (TBD por el usuario)

- Descripciones reales de los 4 juegos (seed)
- Contenido de los 4 PDFs en `/public/pdfs/`
- Archivos PNG reales (reemplazar placeholders 1x1)
