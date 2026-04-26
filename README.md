# HR Flow AI

> An AI-powered HR & Organizational Development SaaS for SMEs in Pakistan and
> global remote-first companies.

HR Flow AI is a production-structured Next.js full-stack app that combines a
classic HR system (employees, departments, role-based access) with an AI
toolkit that generates **job descriptions**, **organizational structures**,
and **country-aware salary bands** in seconds.

- **Web:** Next.js 14 (App Router, React 18, TypeScript)
- **API:** Next.js Route Handlers (REST, zod-validated)
- **Auth:** Auth.js (NextAuth v5) with credentials + JWT sessions
- **DB:** PostgreSQL via Prisma ORM
- **AI:** OpenAI API with deterministic offline mock fallback
- **UI:** TailwindCSS + custom components (Stripe/Notion-style)
- **Tests:** Vitest (unit + route-level handler tests)
- **DevOps:** Dockerfile + docker-compose, GitHub Actions CI

---

## 1. Quick start (Docker — recommended)

```bash
git clone https://github.com/<you>/hr-flow-ai.git
cd hr-flow-ai
cp .env.example .env
# optional: set OPENAI_API_KEY in .env to enable real LLM output
docker compose up --build
```

The first boot runs `prisma migrate deploy` automatically. Seed the demo
data from your host after the stack is up:

```bash
docker compose exec app npx tsx prisma/seed.ts
```

Open [http://localhost:3000](http://localhost:3000) and sign in with one of
the seeded demo accounts:

| Role         | Email                 | Password      |
|--------------|-----------------------|---------------|
| Admin        | `admin@acme.test`     | `password123` |
| HR Manager   | `hr@acme.test`        | `password123` |
| Employee     | `employee@acme.test`  | `password123` |

---

## 2. Local development (no Docker)

You need Node 22+, pnpm, and a running PostgreSQL 14+ instance. The fastest
path is to only start Postgres via Compose:

```bash
docker compose up db -d
pnpm install
cp .env.example .env
pnpm prisma:migrate     # creates the schema
pnpm prisma:seed        # loads demo company + users + AI outputs
pnpm dev
```

App: <http://localhost:3000>

### Useful scripts

| Script              | Purpose                                       |
|---------------------|-----------------------------------------------|
| `pnpm dev`          | Next.js dev server                            |
| `pnpm build`        | Prisma generate + production build            |
| `pnpm start`        | Run the production server                     |
| `pnpm lint`         | ESLint (Next.js core-web-vitals config)       |
| `pnpm typecheck`    | `tsc --noEmit`                                |
| `pnpm test`         | Vitest (unit + handler tests)                 |
| `pnpm prisma:migrate` | Create + apply a dev migration              |
| `pnpm prisma:seed`  | Seed demo data                                |
| `pnpm db:reset`     | Drop + recreate + reseed                      |

---

## 3. Environment variables

All variables live in `.env`. See `.env.example` for the full list.

| Variable         | Required | Notes                                                  |
|------------------|----------|--------------------------------------------------------|
| `DATABASE_URL`   | yes      | Postgres connection string                              |
| `AUTH_SECRET`    | yes      | Generate with `openssl rand -base64 32`                 |
| `NEXTAUTH_URL`   | yes      | Public URL of the app (`http://localhost:3000` locally) |
| `OPENAI_API_KEY` | no       | If unset, mock AI is used                               |
| `OPENAI_MODEL`   | no       | Defaults to `gpt-4o-mini`                               |

If `OPENAI_API_KEY` is not set, the app still generates realistic output via
a built-in deterministic mock generator. The UI shows a `mock` badge on those
generations so you know what's running.

---

## 4. Folder structure

```
hr-flow-ai/
├── prisma/
│   ├── schema.prisma            # DB schema (Company, User, Department,
│   │                            #            Employee, AiOutput)
│   └── seed.ts                  # Demo tenant + users + AI outputs
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (app)/               # Authenticated app surface
│   │   │   ├── layout.tsx       # Sidebar + auth guard + signout
│   │   │   ├── dashboard/
│   │   │   ├── employees/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── departments/
│   │   │   └── ai/
│   │   │       ├── job-description/
│   │   │       ├── org-structure/
│   │   │       └── salary-band/
│   │   ├── login/               # Credentials login
│   │   ├── register/            # Self-service tenant signup
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── employees/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── departments/route.ts
│   │   │   ├── ai/
│   │   │   │   ├── job-description/route.ts
│   │   │   │   ├── org-structure/route.ts
│   │   │   │   ├── salary-band/route.ts
│   │   │   │   └── outputs/route.ts
│   │   │   └── dashboard/stats/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Marketing landing
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # Button, Input, Card, Badge (shadcn-style)
│   │   ├── dashboard/           # DeptBarChart, RecentOutputs
│   │   ├── employees/           # NewEmployeeForm, NewDepartmentForm
│   │   ├── ai/                  # JD, Org, Salary generators
│   │   └── providers.tsx        # SessionProvider wrapper
│   ├── lib/
│   │   ├── auth.ts              # Auth.js v5 config
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── rbac.ts              # requireAuth / requireRole / can()
│   │   ├── api.ts               # Route handler error wrapper
│   │   ├── utils.ts             # cn(), formatCurrency(), initials()
│   │   ├── validators.ts        # Zod schemas for every API input
│   │   └── ai/
│   │       ├── client.ts        # OpenAI wrapper + aiEnabled()
│   │       ├── prompts.ts       # System + user prompt templates
│   │       ├── mock.ts          # Deterministic offline generators
│   │       ├── generators.ts    # Real + mock fallback entrypoints
│   │       └── types.ts         # JobDescription, OrgChart, SalaryBand
│   ├── middleware.ts            # Edge auth redirect
│   └── types/
│       └── next-auth.d.ts       # Session shape augmentation
├── tests/
│   ├── ai.test.ts               # Mock generators + validators
│   └── api-employees.test.ts    # GET /api/employees handler test
├── Dockerfile                   # Multi-stage production build
├── docker-compose.yml           # app + Postgres
├── .github/workflows/ci.yml     # Lint + typecheck + test + build
├── next.config.mjs              # standalone output for Docker
├── tailwind.config.ts
├── vitest.config.ts
├── .env.example
└── README.md
```

---

## 5. Architecture decisions

### Why Next.js App Router + Route Handlers
- One codebase, one deploy, one build for the entire stack.
- The App Router's server components pair naturally with Prisma — dashboard
  and list pages read data server-side with no client loading spinners.
- Route Handlers are stateless and testable in isolation (see `tests/`),
  giving us the benefits of a classic REST API without a second runtime.

### Why Auth.js (NextAuth v5) with JWT + Credentials
- JWT sessions avoid a DB hit on every request while still supporting RBAC
  via claims (`role`, `companyId`).
- Credentials provider keeps the demo self-contained. Swapping to OAuth
  (Google, Microsoft, SSO) is a one-file change.
- Role enforcement lives in `src/lib/rbac.ts` and is the single source of
  truth used by both API routes and server components.

### Why Prisma + PostgreSQL
- Fully typed schema with relations (Company → Employees/Departments/Users,
  AI outputs scoped per company).
- Multi-tenant safe: every query filters by `companyId` sourced from the
  authenticated session, not from client input.
- SQLite is a drop-in replacement for air-gapped demos (change the
  `datasource provider` and run a fresh migration) — but PostgreSQL is the
  primary supported database.

### AI: real provider with graceful mock fallback
- `src/lib/ai/generators.ts` is the single entrypoint called by every AI
  route. When `OPENAI_API_KEY` is set, it calls OpenAI in JSON mode; if the
  API call fails (or no key is configured), it degrades to a deterministic
  mock generator. **The product never hard-fails on AI.**
- Prompts are centralized in `src/lib/ai/prompts.ts`, making iteration and
  A/B testing straightforward.
- Every generation is persisted to `AiOutput` with its input, output, and
  model tag so the dashboard can show history.

### RBAC model
- Three roles: `ADMIN`, `HR_MANAGER`, `EMPLOYEE`.
- `ADMIN` is a superset of `HR_MANAGER`. `EMPLOYEE` can view the dashboard
  and directory but cannot mutate data or use the AI toolkit.
- Enforced in **three layers**: middleware (redirect unauthenticated users),
  `requireRole` in API routes, and UI route guards in `(app)` server
  components.

### Why multi-stage Docker
- The production image is based on `next.config.mjs` `output: "standalone"`,
  which only ships the server code and its runtime deps. The resulting
  image is small and boots fast.
- `docker-compose.yml` wires Postgres + app with a healthcheck so migrations
  run automatically on first boot.

---

## 6. Tests

```bash
pnpm test
```

Covers:

- Zod validators for each API input.
- All three mock AI generators (JD, org chart, salary band) — including
  edge cases like unknown levels/countries.
- `GET /api/employees` handler — asserts it scopes queries to the caller's
  `companyId`. (This is the key multi-tenant invariant.)

You can add more integration tests by mocking `@/lib/db` and `@/lib/rbac`
following the pattern in `tests/api-employees.test.ts`.

---

## 7. Production checklist

Before deploying:

1. Rotate `AUTH_SECRET` to a real secret.
2. Set `NEXTAUTH_URL` to your public HTTPS URL.
3. Provide `DATABASE_URL` for a managed Postgres (Supabase, Neon, RDS).
4. Run `npx prisma migrate deploy` as part of your release pipeline.
5. Set `OPENAI_API_KEY` if you want real LLM output.
6. Put the app behind a reverse proxy (NGINX, Caddy, Vercel Edge, etc.).
7. Configure observability (logs, APM) and review the `rbac.ts` role matrix
   against your compliance needs.

---

## 8. License

Proprietary — intended as a foundation for an investor-ready SaaS MVP.
Adapt freely for your own product.
