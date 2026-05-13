# TECHNICAL DOCUMENTATION — Book Framework Analyzer
**Date:** April 13, 2026
**Project Path:** `/home/ubuntu/book_framework_analyzer`

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [File Structure](#3-file-structure)
4. [Database Schema](#4-database-schema)
5. [API Endpoints](#5-api-endpoints)
6. [Frontend Pages & Components](#6-frontend-pages--components)
7. [Framework Knowledge Base](#7-framework-knowledge-base)
8. [Environment Variables](#8-environment-variables)
9. [Analysis Workflow](#9-analysis-workflow)
10. [Deployment](#10-deployment)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                   │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Home Page │  │ Analysis View│  │   History Page     │  │
│  │ (Upload)  │  │ (Split-Screen│  │   (Past Analyses)  │  │
│  │           │  │  Original vs │  │                    │  │
│  │           │  │  Suggestions)│  │                    │  │
│  └─────┬─────┘  └──────┬───────┘  └────────┬──────────┘  │
│        │               │                    │             │
└────────┼───────────────┼────────────────────┼─────────────┘
         │               │                    │
         ▼               ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│                    API ROUTES (Next.js)                   │
│                                                          │
│  POST /api/upload/presigned  ── Generate S3 upload URL   │
│  POST /api/upload/complete   ── Finalize upload record   │
│  POST /api/analyze           ── Run LLM analysis (SSE)   │
│  GET  /api/analyses          ── List all analyses        │
│  GET  /api/analyses/[id]     ── Get single analysis      │
│  PATCH /api/analyses/[id]    ── Update notes             │
│  DELETE /api/analyses/[id]   ── Delete analysis + file   │
│  GET  /api/export            ── Export as Markdown/JSON   │
└────────┬──────────────┬─────────────────────┬────────────┘
         │              │                     │
         ▼              ▼                     ▼
┌──────────────┐ ┌──────────────┐ ┌───────────────────────┐
│  AWS S3      │ │  PostgreSQL  │ │  Abacus.AI LLM API    │
│  (PDF Store) │ │  (Prisma ORM)│ │  (gpt-4.1-mini)       │
│              │ │              │ │  via chat/completions  │
└──────────────┘ └──────────────┘ └───────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Details |
|-------|-----------|--------|
| Frontend | Next.js 14.2.28 | App Router, React Server Components |
| Styling | Tailwind CSS | Custom theme with dark/light mode |
| Animations | Framer Motion | Page transitions and UI animations |
| Icons | Lucide React | Consistent icon library |
| Toasts | React Hot Toast | User notifications |
| Database | PostgreSQL | Via Prisma ORM |
| ORM | Prisma Client | Type-safe database access |
| File Storage | AWS S3 | Presigned URL uploads |
| LLM | Abacus.AI API | gpt-4.1-mini model via OpenAI-compatible endpoint |
| Language | TypeScript | Full type safety |

---

## 3. File Structure

```
book_framework_analyzer/
├── nextjs_space/
│   ├── prisma/
│   │   └── schema.prisma              # Database schema
│   ├── lib/
│   │   ├── db.ts                      # Prisma client singleton
│   │   ├── s3.ts                      # S3 operations (presigned URLs, delete)
│   │   ├── aws-config.ts             # AWS S3 configuration
│   │   ├── framework-knowledge.ts     # Bestseller framework knowledge base
│   │   ├── types.ts                   # TypeScript type definitions
│   │   └── utils.ts                   # Utility functions
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with theme provider
│   │   ├── page.tsx                   # Home page (upload + info)
│   │   ├── globals.css                # Global styles
│   │   ├── history/
│   │   │   └── page.tsx               # Analysis history page
│   │   ├── analysis/
│   │   │   └── [id]/
│   │   │       ├── page.tsx           # Analysis detail server page
│   │   │       └── _components/
│   │   │           └── analysis-detail-client.tsx  # Split-screen view
│   │   └── api/
│   │       ├── upload/
│   │       │   ├── presigned/route.ts  # Generate presigned upload URL
│   │       │   └── complete/route.ts   # Complete upload + create record
│   │       ├── analyze/route.ts        # LLM analysis endpoint (SSE)
│   │       ├── analyses/
│   │       │   ├── route.ts            # List all analyses
│   │       │   └── [id]/route.ts       # CRUD single analysis
│   │       └── export/route.ts         # Export as Markdown
│   ├── components/
│   │   ├── header.tsx                 # App header with nav
│   │   ├── upload-zone.tsx            # Drag-and-drop PDF upload
│   │   ├── analysis-view.tsx          # Split-screen analysis component
│   │   ├── theme-provider.tsx         # Dark/light mode provider
│   │   └── ui/                        # Shadcn UI components
│   ├── data/                          # Framework research files
│   │   ├── alltime_bestsellers.md
│   │   ├── recent_bestsellers.md
│   │   ├── framework_analysis.md
│   │   └── final_report.md
│   ├── .env                           # Environment variables
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── business_books_research/           # Original research output
    ├── alltime_bestsellers.md (+ PDF)
    ├── recent_bestsellers.md (+ PDF)
    ├── framework_analysis.md (+ PDF)
    └── final_report.md (+ PDF)
```

---

## 4. Database Schema

```prisma
model Analysis {
  id                String   @id @default(cuid())
  filename          String
  cloudStoragePath  String
  originalStructure Json?       // Parsed chapter structure from manuscript
  suggestions       Json?       // Full LLM analysis results
  frameworkMatch    String?     // Primary framework match name
  notes             String?  @db.Text  // User annotations
  status            String   @default("pending")  // pending|analyzing|completed|error
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

**Status Flow:**
```
pending → analyzing → completed
                    → error
```

---

## 5. API Endpoints

### POST `/api/upload/presigned`
- **Purpose:** Generate a presigned S3 URL for PDF upload
- **Request:** `{ filename, contentType }`
- **Response:** `{ presignedUrl, cloudStoragePath, headers }`
- **Auth:** None (personal use)

### POST `/api/upload/complete`
- **Purpose:** Create Analysis record after upload completes
- **Request:** `{ filename, cloudStoragePath }`
- **Response:** `{ id, filename, status }` (Analysis record)

### POST `/api/analyze`
- **Purpose:** Run LLM-powered framework analysis on uploaded manuscript
- **Request:** `{ analysisId, chapterByChapter? }`
- **Response:** Server-Sent Events (SSE) stream
- **LLM Model:** `gpt-4.1-mini` via Abacus.AI API
- **Process:**
  1. Retrieve PDF from S3
  2. Convert to base64
  3. Send to LLM with framework knowledge prompt
  4. Stream response back to client
  5. Save results to database on completion

**Analysis JSON Structure:**
```json
{
  "currentStructure": {
    "chapters": [
      {
        "title": "Chapter title",
        "chapterNumber": 1,
        "content": "Extracted text (500+ words)",
        "keyPoints": ["Point 1", "Point 2"]
      }
    ],
    "totalChapters": 10,
    "estimatedWordCount": 50000
  },
  "componentScores": {
    "story": { "score": 0-100, "present": [...], "missing": [...], "fixes": [...] },
    "principles": { "score": 0-100, "present": [...], "missing": [...], "fixes": [...] },
    "system": { "score": 0-100, "present": [...], "missing": [...], "fixes": [...] },
    "research": { "score": 0-100, "present": [...], "missing": [...], "fixes": [...] }
  },
  "overallScore": 0-100,
  "prioritizedFixes": [
    {
      "priority": 1,
      "component": "story|principles|system|research",
      "issue": "Description",
      "fix": "Action to take",
      "impact": "Why it matters",
      "bestseller_example": "How X book does this"
    }
  ],
  "transformationSummary": "Overall path to bestseller-ready"
}
```

### GET `/api/analyses`
- **Purpose:** List all saved analyses
- **Response:** Array of Analysis records

### GET `/api/analyses/[id]`
- **Purpose:** Get single analysis with full results
- **Response:** Full Analysis record with suggestions JSON

### PATCH `/api/analyses/[id]`
- **Purpose:** Update user notes/annotations
- **Request:** `{ notes }`
- **Response:** Updated Analysis record

### DELETE `/api/analyses/[id]`
- **Purpose:** Delete analysis and associated S3 file
- **Response:** `{ success: true }`

### GET `/api/export`
- **Purpose:** Export analysis as Markdown
- **Query Params:** `id`, `format` ("markdown"), `download` ("true" for attachment)
- **Response:** JSON `{ content, filename }`

---

## 6. Frontend Pages & Components

### Pages

| Route | Component | Description |
|-------|-----------|------------|
| `/` | `app/page.tsx` | Home page with upload zone, framework cards, how-it-works |
| `/history` | `app/history/page.tsx` | List of all past analyses with status, scores, actions |
| `/analysis/[id]` | `app/analysis/[id]/page.tsx` | Individual analysis detail with split-screen view |

### Key Components

| Component | File | Description |
|-----------|------|------------|
| `Header` | `components/header.tsx` | Nav bar with branding, history link, theme toggle |
| `UploadZone` | `components/upload-zone.tsx` | Drag-and-drop PDF upload with progress |
| `AnalysisView` | `components/analysis-view.tsx` | Split-screen: original structure vs suggestions |
| `AnalysisDetailClient` | `app/analysis/[id]/_components/analysis-detail-client.tsx` | Full detail view with chapter navigation |

### Split-Screen UI Layout
```
┌─────────────────────┬─────────────────────┐
│   LEFT PANEL        │   RIGHT PANEL       │
│                     │                     │
│   Original          │   Component Scores  │
│   Structure         │   (Story, Principles│
│                     │    System, Research) │
│   • Chapter titles  │                     │
│   • Key points      │   Fixes & Suggestions│
│   • Content preview │   • What's present  │
│                     │   • What's missing  │
│                     │   • How to fix      │
│                     │   • Bestseller      │
│                     │     examples        │
│                     │                     │
│                     │   Prioritized Fixes │
│                     │   • #1 highest      │
│                     │     impact          │
│                     │   • #2 next         │
│                     │                     │
│                     │   Transformation    │
│                     │   Summary           │
└─────────────────────┴─────────────────────┘
```

---

## 7. Framework Knowledge Base

The app evaluates manuscripts against **The Principle-Based Hybrid Framework** — the only framework that has produced 100M+ combined book sales.

### The 4 Essential Components

| Component | What It Evaluates | Bestseller Examples |
|-----------|-------------------|--------------------|
| **Story Elements** | Personal anecdotes, case studies, emotional narratives, character-driven examples | Rich Dad Poor Dad (two fathers parable), Atomic Habits (personal injury story) |
| **Principle Elements** | Named laws/rules/habits, proprietary vocabulary, core philosophy | 7 Habits (7 numbered habits), Atomic Habits (4 Laws), Think and Grow Rich (13 principles) |
| **System Elements** | Step-by-step tactics, checklists, templates, action items, before/after path | Atomic Habits (specific tactics), Deep Work (4 rules with sub-strategies) |
| **Research Elements** | Data, statistics, studies, expert citations, scientific backing | Atomic Habits (behavioral psychology), Good to Great (5 years research) |

### Scoring
- **Strong:** 80-100% — Well-developed throughout
- **Moderate:** 40-79% — Present but inconsistent
- **Weak:** 1-39% — Barely present
- **Missing:** 0% — Absent

**Bestseller-ready = 70%+ on ALL FOUR components**

### Optimal Structure Blueprint
- **Part 1: The Idea (30-40%)** — Opening hook, big idea, evidence, vision
- **Part 2: The System (60-70%)** — Framework overview + chapters per principle (story + research + tactics + action)

---

## 8. Environment Variables

| Variable | Purpose |
|----------|--------|
| `DATABASE_URL` | PostgreSQL connection string (Prisma) |
| `AWS_PROFILE` | AWS credentials profile |
| `AWS_REGION` | S3 bucket region |
| `AWS_BUCKET_NAME` | S3 bucket for PDF storage |
| `AWS_FOLDER_PREFIX` | S3 key prefix for uploads |
| `ABACUSAI_API_KEY` | API key for LLM analysis |

---

## 9. Analysis Workflow

```
┌──────────────┐
│  User uploads │
│  PDF file     │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Generate presigned│
│ S3 upload URL    │
│ POST /api/upload/ │
│ presigned        │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Upload PDF to S3  │
│ (client-side)    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Create Analysis   │
│ record in DB     │
│ POST /api/upload/ │
│ complete         │
│ Status: pending  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Trigger analysis  │
│ POST /api/analyze │
│ Status: analyzing│
└──────┬───────────┘
       │
       ▼
┌──────────────────────────┐
│ Download PDF from S3      │
│ Convert to base64         │
│ Send to LLM with:         │
│  • Framework knowledge    │
│  • System prompt          │
│  • PDF as file attachment │
│ Stream SSE response       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Parse LLM JSON response   │
│ Save to DB:               │
│  • originalStructure      │
│  • suggestions            │
│  • frameworkMatch         │
│ Status: completed         │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Display split-screen view │
│ Original ◄──► Suggestions │
│ User can add notes,       │
│ export, or re-analyze     │
└──────────────────────────┘
```

---

## 10. Deployment

**Current Status:** Built and checkpointed. NOT YET deployed to a public URL.

**To Deploy:** Click the Deploy button in the Abacus.AI UI, or use the `deploy_nextjs_project` tool.

**Production Build:**
```bash
cd /home/ubuntu/book_framework_analyzer/nextjs_space
yarn run build
```

**Build Output:** Standalone Next.js build in `.build/standalone/`
