# CV AI Enhancer

A production-quality personal web application for AI-assisted CV analysis and tailoring. This application allows users to manage their professional profile, analyze job descriptions, and generate tailored CVs using AI.

## Features

- **User Authentication**: Secure login/register with Supabase Auth
- **Profile Management**: Complete professional profile with work experience, skills, education, and languages
- **Job Description Analysis**: AI-powered analysis comparing your profile against job descriptions
- **CV Generation**: Generate tailored CVs in Markdown format based on job descriptions
- **PDF Export**: Download generated CVs as PDF files

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend/Async**: Trigger.dev v4 for background jobs
- **AI**: Mastra framework with OpenAI (GPT-4o)
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Deployment**: Vercel (frontend), Trigger.dev Cloud (workflows)

## Getting Started

### Prerequisites

- Node.js 20.9+ or Bun
- Supabase account
- Trigger.dev account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cv-ai-enancher
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your environment variables:
- `DATABASE_URL`: Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `TRIGGER_SECRET_KEY`: Your Trigger.dev secret key
- `OPENAI_API_KEY`: Your OpenAI API key

4. Set up the database:
```bash
# Step 1: Create tables using Prisma (this creates the schema)
bun run db:push

# Step 2: Apply Supabase RLS policies (this adds security)
# If using Supabase CLI locally:
supabase db reset
# Or manually run the migration:
# psql $DATABASE_URL -f supabase/migrations/001_rls_policies.sql
```

**Important**: Always run Prisma migrations/push FIRST to create tables, then apply Supabase migrations for RLS policies.

5. Start the development server:
```bash
bun run dev
```

6. In another terminal, start Trigger.dev:
```bash
bun run trigger:dev
```

## Project Structure

```
app/
├── (auth)/              # Authentication pages
├── (protected)/         # Protected routes
│   ├── profile/         # Profile management
│   ├── jobs/            # Job descriptions
│   └── cv/              # Generated CVs
├── api/                 # API routes
└── lib/                 # Utilities and clients

trigger/
└── src/
    ├── tasks/           # Trigger.dev tasks
    └── lib/
        └── mastra/      # Mastra agents, workflows, tools

prisma/
└── schema.prisma        # Database schema

supabase/
└── migrations/          # Supabase RLS policies (run AFTER Prisma creates tables)
```

## Development

### Running Locally

1. Start Next.js dev server: `bun run dev`
2. Start Trigger.dev dev server: `bun run trigger:dev`
3. Open [http://localhost:3000](http://localhost:3000)

### Database Management

- Generate Prisma Client: `bun run db:generate`
- Push schema changes: `bun run db:push` (creates/updates tables)
- Create migration: `bun run db:migrate` (creates Prisma migration files)
- Open Prisma Studio: `bun run db:studio`

**Database Setup Order:**
1. `bun run db:push` - Creates tables from Prisma schema
2. Apply Supabase migrations - Adds RLS policies (run manually or via Supabase CLI)

### Trigger.dev

- Deploy workflows: `bun run trigger:deploy`
- View dashboard: https://cloud.trigger.dev

## Architecture

The application follows a clean architecture with:

- **Frontend**: Next.js 16 App Router with Server Components
- **API Layer**: Next.js API routes for CRUD operations
- **Background Jobs**: Trigger.dev v4 tasks for async processing
- **AI Layer**: Mastra workflows orchestrate AI operations
- **Database**: Prisma ORM on top of Supabase PostgreSQL
- **Security**: Supabase RLS policies for row-level security

## Database Migration Strategy

**Why both Prisma and Supabase migrations?**

- **Prisma**: Handles table creation, schema changes, and data migrations
- **Supabase**: Handles Row Level Security (RLS) policies, which Prisma cannot manage

**Migration Workflow:**
1. Define schema in `prisma/schema.prisma`
2. Run `bun run db:push` to create/update tables
3. Apply Supabase migrations from `supabase/migrations/` for RLS policies

## Domain Rules

**Critical**: The user profile is the single source of truth. AI operations:
- Cannot invent experience, skills, or qualifications
- Can only rephrase and restructure existing data
- Must explicitly state when data is missing
- Must validate generated content against profile data

## Documentation

See the `docs/` directory for detailed documentation:
- Architecture decisions
- Database schema
- API endpoints
- Deployment guide
- Feature documentation
