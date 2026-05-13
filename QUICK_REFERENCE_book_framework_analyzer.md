# QUICK REFERENCE: Book Framework Analyzer

## Start Dev Server
```bash
cd /home/ubuntu/book_framework_analyzer/nextjs_space && nohup yarn dev > /tmp/dev.log 2>&1 &
```

## Key Files
| File | Purpose |
|------|--------|
| `app/api/analyze/route.ts` | LLM analysis endpoint |
| `lib/framework-knowledge.ts` | Hybrid framework knowledge base |
| `components/analysis-view.tsx` | Split-screen results UI |
| `components/upload-zone.tsx` | PDF upload component |
| `app/page.tsx` | Home page |
| `app/api/export/route.ts` | Markdown export |
| `prisma/schema.prisma` | Database schema |

## The Formula
**ALL 4 components must score 70%+ for bestseller readiness:**

| Component | What | Bestseller Example |
|-----------|------|--------------------|
| Story | Anecdotes, case studies, hooks | Rich Dad Poor Dad |
| Principles | Named rules/laws, vocab | Atomic Habits (4 Laws) |
| System | Step-by-step tactics | Deep Work (4 Rules) |
| Research | Data, studies, citations | Good to Great |

## User's Book
- **Title:** Reshaping Recruitment
- **Topic:** Growth marketing + recruitment
- **File:** `/home/ubuntu/Uploads/Reshaping Recruitment (3).pdf`
- **Size:** 22.2 MB, 16 chapters, ~120k words

## Environment
- **LLM:** gpt-4.1-mini via Abacus AI API
- **Temperature:** 0 (deterministic)
- **DB:** PostgreSQL via Prisma
- **Storage:** AWS S3
- **Deployment:** Not yet deployed
