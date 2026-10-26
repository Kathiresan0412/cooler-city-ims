# Cooler City IMS

Inventory Management System for Cooler City — built with Next.js 15, Prisma, Auth.js, shadcn/ui, and TanStack Table.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Auth.js v5 (NextAuth) with Prisma adapter
- **UI**: shadcn/ui + Tailwind CSS
- **Tables**: TanStack Table v8
- **Validation**: Zod + React Hook Form
- **File uploads**: Vercel Blob
- **Exports**: XLSX, jsPDF

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start dev server
npm run dev
```

## Project Structure

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — Reusable React components
- `src/server/` — Server Actions, services (business logic), and queries
- `src/lib/` — Utilities, Prisma client, auth config, permissions
- `src/hooks/` — Custom React hooks
- `src/providers/` — Context providers
- `src/types/` — TypeScript type definitions
- `src/config/` — Navigation and site configuration
- `prisma/` — Database schema, migrations, and seed data

Kitchen Inventory lets staff issue products from a stock location and record full or partial returns. Issued and returned quantities are reflected in the stock ledger.

## Roles & Permissions

Roles and permissions are stored in the database and checked at both the middleware and server action level. The `can()` helper in `src/lib/permissions.ts` is the single source of truth.
