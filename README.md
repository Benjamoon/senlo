<p align="center">
  <img src="https://github.com/user-attachments/assets/be7f4f59-3180-4a03-b016-b85311a22b19" alt="Senlo logo" width="280" />
</p>

# Senlo — Open-Source Email Editor & Infrastructure

Senlo is an open-source, self-hosted email editor and infrastructure for product, transactional, and lifecycle emails.

It provides a visual builder, template management, contacts, and automation flows, while remaining provider-agnostic for email delivery.  
You can integrate your own SMTP or ESP and keep full control over your data and workflows.

## What Senlo Is For

- Transactional emails (password reset, receipts, verification)
- Product and lifecycle emails
- Embedded email editors inside SaaS products
- Teams that want self-hosted or white-label solutions

## Core Capabilities

- Visual drag-and-drop email editor
- Template versioning and structured JSON documents
- Dynamic variables and preview with mock data
- Provider-agnostic integrations (SMTP / ESP APIs)
- Multi-project and multi-user isolation
- Self-hosted deployment

Senlo gives you the **engine and UI**.  
You decide how emails are stored, rendered, and sent.

## Why Senlo

Most email platforms combine editing, sending, analytics, and marketing tools into a single closed ecosystem.  
Senlo separates concerns and provides an open infrastructure layer that you can integrate into your own stack.

This makes it suitable for:

- SaaS products that need built-in email editing
- Agencies requiring white-label solutions
- Teams that want to avoid vendor lock-in
- Developer-first workflows

## Architecture

```text
apps/
  web/                  # Next.js Application (The Dashboard & API)

packages/
  core/                 # Domain models, MJML/HTML renderers, interfaces
  editor/               # The visual builder engine
  ui/                   # Reusable UI component library (design system)
  db/                   # Database schema, migrations, and repositories
```

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS.
- **State Management**: Zustand (Immer for state immutability).
- **Backend**: Next.js Server Actions & API Routes.
- **Database**: PostgreSQL with Drizzle ORM.
- **Communication**: Auth.js, Zod (Validation), Resend/Mailgun (Sending).
- **Package Management**: pnpm workspaces (Monorepo).

## Author

**Igor Filippov**

- GitHub: [@IgorFilippov3](https://github.com/IgorFilippov3)

## Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   pnpm install
   ```
2. **Setup your environment**:
   Copy `.env.example` to `apps/web/.env` and fill in your database URL and secret.
3. **Push the schema**:
   ```bash
   pnpm db:push
   ```
4. **Start the dev server**:
   ```bash
   pnpm dev
   ```

### Production Deployment (Self-hosted)

The easiest way to deploy Senlo is using Docker Compose. Check our [VPS Deployment Guide](./deploy/vps/README.md) for step-by-step instructions.

## Status

Senlo is currently in active development (MVP stage). We are stabilizing the API and adding core features. Contributions and feedback are welcome!

Check out our [Roadmap](ROADMAP.md) for planned features and upcoming improvements.
