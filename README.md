# Quartermaster

Internal admin panel for [Mladi Pirati](https://mladipirati.si).

Quartermaster manages the Mladi Pirati merchandise shop — items, images, orders, pickup locations, and shipping options — and generates Slovenian pro-forma invoices (predračun) with UPN QR payment codes. Access is restricted to authorized Mladi Pirati members via Keycloak SSO.

## Features

- Shop item management with S3 image uploads and drag-and-drop reordering
- Order management (view, manage, fulfill)
- Pickup locations and shipping options management
- Pro-forma invoice (predračun) PDF generation
- UPN QR code generation for Slovenian bank payments (ZBS-compliant)
- Keycloak SSO with authorization via Helm API
- Cloudflare Turnstile bot protection on the public order API
- DB-backed rate limiting

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | Framework |
| React 19 | UI |
| TypeScript | Language |
| Drizzle ORM + PostgreSQL | Database |
| next-auth v5 (Keycloak) | Authentication |
| S3-compatible storage | Image hosting |
| shadcn/ui + Tailwind CSS v4 | UI components |
| @react-pdf/renderer | PDF invoice generation |
| Cloudflare Turnstile | CAPTCHA / bot protection |
| Helm SDK (`@mp/helm-sdk`) | Authorization |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (package manager / runtime)
- Docker + Docker Compose
- A running Keycloak instance with a `quartermaster` client configured in the `mladipirati` realm
- S3-compatible bucket (the project uses [Garage](https://garagehq.deuxfleurs.fr/))
- Access to the Helm API

### Steps

1. **Clone and install**

   ```bash
   git clone https://github.com/mladi-pirati/quartermaster.git
   cd quartermaster
   bun install
   ```

   > **Note:** `bun install` automatically builds the `@mp/helm-sdk` git dependency via the `postinstall` script. If you later run `bun add <pkg>`, re-run `bun run postinstall` manually — `bun add` skips postinstall scripts and will break the middleware.

2. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env and fill in all values — see Environment Variables below
   ```

3. **Start the database**

   ```bash
   docker compose up -d
   ```

   This starts PostgreSQL on port `5433`.

4. **Run migrations**

   ```bash
   bun run db:migrate
   ```

5. **Start the dev server**

   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `APP_URL` | Public URL of this app |
| `HELM_API_URL` | Base URL of the Helm API |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for next-auth session encryption |
| `AUTH_URL` | Public URL used by next-auth (same as `APP_URL`) |
| `KEYCLOAK_REALM` | Keycloak realm name |
| `KEYCLOAK_CLIENT_ID` | Keycloak client ID for this app |
| `KEYCLOAK_CLIENT_SECRET` | Keycloak client secret |
| `KEYCLOAK_ISSUER` | Keycloak issuer URL |
| `KEYCLOAK_DEFAULT_CLIENT_ROLE` | Default role granted on login |
| `KEYCLOAK_ADMIN` | Keycloak admin API URL |
| `POSTGRES_USER` | PostgreSQL username (used by Docker Compose) |
| `POSTGRES_PASSWORD` | PostgreSQL password (used by Docker Compose) |
| `POSTGRES_DB` | PostgreSQL database name (used by Docker Compose) |
| `MP_TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |
| `MP_TURNSTILE_EXPECTED_HOSTNAME` | Expected hostname for Turnstile validation |
| `S3_ACCESS_KEY_ID` | S3 access key |
| `S3_SECRET_ACCESS_KEY` | S3 secret key |
| `S3_REGION` | S3 region identifier |
| `S3_ENDPOINT` | S3 endpoint URL |
| `S3_BUCKET` | S3 bucket name |

## Project Structure

```
src/
├── actions/         # Next.js server actions
├── app/             # Next.js App Router pages and API routes
│   ├── admin/       # Admin UI (items, orders, pickup-locations, shipping-options)
│   ├── api/         # API routes (orders, auth, admin endpoints)
│   └── login/       # Login page
├── components/      # React components
│   ├── admin/       # Admin-specific components
│   ├── auth/        # Auth components (login form)
│   ├── pdf/         # Invoice PDF document (@react-pdf/renderer)
│   └── ui/          # shadcn/ui components
├── db/              # Drizzle ORM schema and migrations
├── hooks/           # Custom React hooks
├── lib/             # Shared utilities (auth, S3, invoice, rate-limit, format)
│   └── auth/        # Auth helpers (session, Keycloak JWT utils)
└── types/           # TypeScript augmentation files
```

## Contributing

1. Fork the repository and create a branch from `main`
2. Make your changes
3. Run `bun run typecheck` and `bun run lint` before submitting
4. Open a pull request
