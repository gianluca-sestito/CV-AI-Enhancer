# CV AI Enhancer

A production-quality personal web application for AI-assisted CV analysis and tailoring. This application allows users to manage their professional profile, analyze job descriptions, and generate tailored CVs using AI.

## Features

- **User Authentication**: Secure login/register with Supabase Auth
- **Profile Management**: Complete professional profile with work experience, skills, education, languages, and profile images
- **CV Import**: Import existing CVs from PDF or Markdown files using AI extraction
- **Job Description Analysis**: AI-powered analysis comparing your profile against job descriptions with match scores, strengths, gaps, and recommendations
- **CV Generation**: Generate tailored CVs with structured content based on job descriptions
- **CV Editor**: Interactive CV editor with customizable themes, typography, spacing, and layout
- **PDF Export**: Download generated CVs as PDF files
- **Real-time Updates**: Background job processing with status tracking

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

**Required:**
- `DATABASE_URL`: Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server-side operations)
- `TRIGGER_SECRET_KEY`: Your Trigger.dev secret key
- `OPENAI_API_KEY`: Your OpenAI API key

**Optional:**
- `NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY`: Trigger.dev public API key (if using public API)

4. Set up the database:
```bash
# Step 1: Create tables using Prisma (this creates the schema)
bun run db:push

# Step 2: Apply Supabase migrations (RLS policies and storage buckets)
# If using Supabase CLI locally:
supabase db reset
# Or manually run migrations in order:
# psql $DATABASE_URL -f supabase/migrations/001_rls_policies.sql
# psql $DATABASE_URL -f supabase/migrations/002_create_storage_bucket.sql
# psql $DATABASE_URL -f supabase/migrations/003_add_job_requirements_to_analysis.sql
# psql $DATABASE_URL -f supabase/migrations/004_update_storage_bucket_for_cv_imports.sql
```

**Important**: Always run Prisma migrations/push FIRST to create tables, then apply Supabase migrations for RLS policies and storage setup.

5. Set up Supabase Storage:
   - See [docs/STORAGE_SETUP.md](./docs/STORAGE_SETUP.md) for detailed instructions
   - The storage bucket `profile-images` is created automatically via migration 002
   - Supports profile images, PDF CVs, and Markdown files

6. Start the development server:
```bash
bun run dev
```

7. In another terminal, start Trigger.dev:
```bash
bun run trigger:dev
```

## Project Structure

```
app/
├── (auth)/                    # Authentication pages (login, register)
├── (protected)/               # Protected routes requiring authentication
│   ├── profile/               # Profile management (personal info, skills, experience, etc.)
│   ├── jobs/                  # Job descriptions management and analysis
│   │   ├── [id]/              # Individual job view with analysis
│   │   └── new/                # Create new job description
│   └── cv/                    # Generated CVs
│       └── [id]/              # CV editor with customization options
├── api/                       # Next.js API routes
│   ├── profile/               # Profile CRUD operations
│   ├── jobs/                  # Job description endpoints
│   ├── analysis/              # Job analysis endpoints
│   └── cv/                    # CV generation and management
└── lib/                       # Utilities and clients
    ├── prisma/                # Prisma client
    ├── supabase/              # Supabase clients (auth, server, admin)
    └── trigger/               # Trigger.dev client

trigger/
└── src/
    ├── tasks/                 # Trigger.dev background tasks
    │   ├── analyzeJobDescription.ts
    │   ├── generateTailoredCV.ts
    │   └── importCV.ts
    └── lib/
        ├── mastra/            # Mastra AI framework integration
        │   ├── agents/        # AI agents (analysis, content, CV generation, import)
        │   ├── tools/         # AI tools (validation, extraction, scoring)
        │   └── workflows/     # AI workflows
        ├── prisma/            # Prisma client for tasks
        ├── types/             # TypeScript types and schemas
        └── utils/             # Utility functions (PDF extraction, caching, etc.)

prisma/
└── schema.prisma              # Database schema (Prisma ORM)

supabase/
└── migrations/                # Supabase SQL migrations
    ├── 001_rls_policies.sql   # Row Level Security policies
    ├── 002_create_storage_bucket.sql
    ├── 003_add_job_requirements_to_analysis.sql
    └── 004_update_storage_bucket_for_cv_imports.sql
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
2. Apply Supabase migrations - Adds RLS policies and storage buckets (run manually or via Supabase CLI)

### Supabase CLI

- Start local Supabase: `bun run supabase:start`
- Stop local Supabase: `bun run supabase:stop`
- Reset database: `bun run supabase:reset` (applies all migrations)

### Trigger.dev

- Deploy workflows: `bun run trigger:deploy`
- View dashboard: https://cloud.trigger.dev
- Tasks run asynchronously in the background
- Check task status via the Trigger.dev dashboard or API

## Architecture

The application follows a clean architecture with:

- **Frontend**: Next.js 16 App Router with Server Components and Client Components
- **API Layer**: Next.js API routes for CRUD operations and task triggering
- **Background Jobs**: Trigger.dev v4 tasks for async AI processing
- **AI Layer**: Mastra framework with agents, tools, and workflows
- **Database**: Prisma ORM on top of Supabase PostgreSQL
- **Storage**: Supabase Storage for profile images and CV imports
- **Security**: Supabase RLS policies for row-level security

### Background Tasks

The application uses Trigger.dev for asynchronous processing:

1. **analyzeJobDescription**: Analyzes a job description against user profile
   - Extracts job requirements
   - Calculates match score
   - Identifies strengths and gaps
   - Suggests focus areas

2. **generateTailoredCV**: Generates a tailored CV based on job description
   - Uses analysis results
   - Restructures profile data
   - Creates structured CV content
   - Applies best practices for CV formatting

3. **importCV**: Imports CV from PDF or Markdown
   - Extracts text from PDF
   - Parses structured data
   - Validates and imports into profile
   - Handles bulk imports

## Database Migration Strategy

**Why both Prisma and Supabase migrations?**

- **Prisma**: Handles table creation, schema changes, and data migrations
- **Supabase**: Handles Row Level Security (RLS) policies and storage buckets, which Prisma cannot manage

**Migration Workflow:**
1. Define schema in `prisma/schema.prisma`
2. Run `bun run db:push` to create/update tables
3. Apply Supabase migrations from `supabase/migrations/` in order:
   - `001_rls_policies.sql` - Row Level Security policies
   - `002_create_storage_bucket.sql` - Storage bucket for profile images
   - `003_add_job_requirements_to_analysis.sql` - Schema updates
   - `004_update_storage_bucket_for_cv_imports.sql` - Storage bucket updates for CV imports

## Domain Rules

**Critical**: The user profile is the single source of truth. AI operations:
- Cannot invent experience, skills, or qualifications
- Can only rephrase and restructure existing data
- Must explicitly state when data is missing
- Must validate generated content against profile data
- Must preserve accuracy and truthfulness of all information

## API Endpoints

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/upload-image` - Upload profile image
- `POST /api/profile/import` - Import CV from file
- `POST /api/profile/work-experiences` - Add work experience
- `PUT /api/profile/work-experiences` - Update work experience
- `POST /api/profile/education` - Add education
- `PUT /api/profile/education` - Update education
- `POST /api/profile/skills/add` - Add skill
- `PUT /api/profile/skills/update` - Update skill
- `PUT /api/profile/languages` - Update languages

### Jobs
- `GET /api/jobs` - List all job descriptions
- `POST /api/jobs` - Create job description
- `GET /api/jobs/[id]` - Get job description
- `PUT /api/jobs/[id]` - Update job description

### Analysis
- `POST /api/analysis` - Trigger job analysis
- `GET /api/analysis/[id]` - Get analysis result

### CV
- `POST /api/cv` - Generate tailored CV
- `GET /api/cv/[id]` - Get CV
- `PUT /api/cv/[id]` - Update CV
- `PUT /api/cv/[id]/styles` - Update CV styles
- `GET /api/cv/[id]/pdf` - Download CV as PDF

## Documentation

See the `docs/` directory for detailed documentation:
- [Storage Setup](./docs/STORAGE_SETUP.md) - Supabase Storage configuration
- Architecture decisions
- Database schema
- API endpoints
- Deployment guide
- Feature documentation

## License

Private project - All rights reserved
