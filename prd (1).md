# PRD: Intelligent Software Bug Triage Agent (GENAI-23)

**Version:** 2.0 (Cursor / Antigravity Ready)  
**Date:** 30 September 2026  
**Purpose:** This document is written so an AI coding agent (Cursor / Antigravity) can implement the entire system with minimal ambiguity.

---

## 1. Project Overview

Build a full-stack web application that uses **4 specialized AI agents** to automatically triage software bug reports in real time.

**Core Pipeline:**
```
Bug Report → Triage Agent → Intelligence Agent → Reproduction Agent → Routing & Analysis Agent → Developer
```

The system must support:
- User login & role-based access
- Persistent database
- Real-time progress updates
- Interactive clarification chat
- Demo mode with sample data for presentations

---

## 2. Locked Technology Stack (Do Not Change)

| Layer              | Technology                          | Reason |
|--------------------|-------------------------------------|--------|
| Frontend           | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui | Modern, fast, excellent DX |
| Backend            | FastAPI (Python 3.11+)              | Best for AI agents + async |
| Database           | PostgreSQL + SQLAlchemy 2.0 + Alembic | Reliable + easy migrations |
| Vector Store       | ChromaDB (persistent)               | Simple local vector DB |
| Embeddings         | `sentence-transformers/all-MiniLM-L6-v2` | Free + fast |
| LLM                | Groq API (llama-3.3-70b-versatile) or OpenAI GPT-4o | Fast inference |
| Auth               | NextAuth.js (Credentials provider) + JWT | Simple + secure |
| Browser Automation | Selenium 4 + Chrome headless        | Reproduction agent |
| Real-time          | Server-Sent Events (SSE)            | Easy progress streaming |
| Package Manager    | pnpm (frontend) + poetry or pip (backend) | |
| Containerization   | Docker + Docker Compose             | Easy demo deployment |

**Alternative (if time is extremely limited):** Streamlit + SQLite + LangGraph. Prefer the full stack above.

---

## 3. Recommended Project Structure

```
bug-triage-agent/
├── frontend/                          # Next.js 14
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/register/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── bugs/
│   │   │   ├── new/page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── page.tsx
│   │   ├── demo/page.tsx
│   │   ├── admin/page.tsx
│   │   ├── layout.tsx
│   │   └── api/auth/[...nextauth]/route.ts
│   ├── components/
│   │   ├── ui/                        # shadcn components
│   │   ├── BugForm.tsx
│   │   ├── TriageProgress.tsx
│   │   ├── ClarificationChat.tsx
│   │   ├── DuplicateCard.tsx
│   │   ├── EvidenceGallery.tsx
│   │   └── AgentReasoning.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── auth.ts
│   └── types/index.ts
│
├── backend/                           # FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── bug.py
│   │   │   ├── triage.py
│   │   │   └── component.py
│   │   ├── schemas/
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── bugs.py
│   │   │   ├── triage.py
│   │   │   └── admin.py
│   │   ├── agents/
│   │   │   ├── orchestrator.py
│   │   │   ├── triage_agent.py
│   │   │   ├── intelligence_agent.py
│   │   │   ├── reproduction_agent.py
│   │   │   └── routing_agent.py
│   │   ├── services/
│   │   │   ├── embeddings.py
│   │   │   ├── llm.py
│   │   │   ├── selenium_runner.py
│   │   │   └── vector_store.py
│   │   └── utils/
│   ├── alembic/
│   ├── data/
│   │   ├── sample_bugs.json
│   │   └── components.json
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── README.md
└── .env.example
```

---

## 4. Multi-Agent Architecture (Strict Contracts)

### 4.1 Orchestrator (`agents/orchestrator.py`)
- Receives a `bug_id`
- Runs agents sequentially (or with limited parallelism)
- Streams progress events via SSE
- Saves every agent action to `AgentAction` table
- Handles clarification pauses (status = `waiting_for_user`)

### 4.2 Triage Agent
**Input:** Raw bug text + any existing fields  
**Output (JSON):**
```json
{
  "summary": {
    "title": "string",
    "clean_description": "string",
    "steps_to_reproduce": ["step1", "step2"],
    "expected_result": "string",
    "actual_result": "string",
    "environment": "string"
  },
  "is_complete": false,
  "missing_fields": ["steps_to_reproduce", "browser"],
  "clarifying_questions": [
    "What browser and version are you using?",
    "Can you list the exact steps to reproduce the issue?"
  ],
  "reasoning": "string"
}
```

### 4.3 Intelligence Agent
**Input:** Structured summary from Triage Agent + bug embedding  
**Output (JSON):**
```json
{
  "potential_duplicates": [
    {
      "bug_id": "uuid",
      "title": "string",
      "similarity_score": 0.92,
      "reason": "string"
    }
  ],
  "suggested_components": [
    {
      "component_id": "uuid",
      "name": "Authentication",
      "confidence": 0.87,
      "reason": "string"
    }
  ],
  "severity": "critical|high|medium|low",
  "priority": "P0|P1|P2|P3",
  "reasoning": "string"
}
```

### 4.4 Reproduction Agent
**Input:** Structured steps + component  
**Output (JSON):**
```json
{
  "reproduction_status": "reproduced|partial|could_not_reproduce|needs_manual|script_only",
  "generated_selenium_script": "python code as string",
  "evidence": [
    {
      "type": "screenshot|console_log|network|script",
      "path": "string",
      "description": "string"
    }
  ],
  "execution_log": "string",
  "reasoning": "string"
}
```
**Note:** In demo mode, return pre-recorded evidence. Live Selenium only for 1-2 controlled demo apps.

### 4.5 Routing & Analysis Agent
**Input:** All previous agent outputs  
**Output (JSON):**
```json
{
  "is_regression": true,
  "regression_reason": "string",
  "assigned_developer_id": "uuid",
  "assigned_team": "string",
  "final_triage_summary": "markdown string",
  "recommended_actions": ["action1", "action2"],
  "reasoning": "string"
}
```

---

## 5. Database Models (SQLAlchemy)

Implement these exact models:

```python
# User
id: UUID (PK)
email: str (unique)
password_hash: str
name: str
role: Enum("reporter", "developer", "admin")
created_at: datetime

# Component
id: UUID
name: str
description: str
owner_team: str
owner_developer_id: UUID (FK → User)

# Bug
id: UUID
title: str
raw_description: text
structured_data: JSONB          # output from Triage Agent
status: Enum("submitted", "clarifying", "triaging", "reproduced", "routed", "closed", "duplicate")
severity: Enum("critical", "high", "medium", "low")
priority: Enum("P0", "P1", "P2", "P3")
reporter_id: UUID (FK)
assigned_to: UUID (FK, nullable)
component_id: UUID (FK, nullable)
created_at, updated_at

# TriageRun
id: UUID
bug_id: UUID
status: Enum("running", "waiting_for_user", "completed", "failed")
full_report: JSONB
started_at, completed_at

# AgentAction
id: UUID
triage_run_id: UUID
agent_name: str                 # "triage" | "intelligence" | "reproduction" | "routing"
input_data: JSONB
output_data: JSONB
reasoning: text
created_at

# DuplicateMatch
id: UUID
bug_id: UUID
matched_bug_id: UUID
similarity_score: float
confirmed: bool | null

# Evidence
id: UUID
bug_id: UUID
type: str
file_path: str
metadata: JSONB

# ClarificationMessage
id: UUID
bug_id: UUID
sender: Enum("agent", "user")
message: text
created_at

# Feedback
id: UUID
bug_id: UUID
developer_id: UUID
rating_summary: int (1-5)
rating_duplicate: int
rating_component: int
rating_reproduction: int
comments: text
created_at
```

---

## 6. API Endpoints (FastAPI)

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

POST   /api/bugs                     # create bug
GET    /api/bugs                     # list (role filtered)
GET    /api/bugs/{id}
PATCH  /api/bugs/{id}
POST   /api/bugs/{id}/clarify        # user replies to questions
POST   /api/bugs/{id}/confirm-duplicate

POST   /api/triage/{bug_id}/start    # start full pipeline
GET    /api/triage/{bug_id}/stream   # SSE progress stream
GET    /api/triage/{bug_id}/report   # final report

POST   /api/feedback
GET    /api/components
POST   /api/admin/seed-demo          # load sample data
```

---

## 7. Frontend Pages & Key Components

| Route                    | Purpose |
|--------------------------|---------|
| `/login`                 | Login form |
| `/register`              | Registration |
| `/dashboard`             | Role-based home |
| `/bugs/new`              | Submit new bug (supports raw text or structured) |
| `/bugs/[id]`             | Bug detail + live triage progress + chat + evidence |
| `/bugs`                  | List of bugs |
| `/demo`                  | One-click demo scenarios |
| `/admin`                 | User & component management |

**Must-have components:**
- `TriageProgress` – shows current agent + progress bar
- `ClarificationChat` – chat UI for missing info
- `DuplicateCard` – side-by-side comparison
- `EvidenceGallery` – screenshots + download script
- `AgentReasoning` – expandable “Why did the agent decide this?”

---

## 8. Sample Data Requirements

Create `backend/data/sample_bugs.json` with at least 12 bugs covering:

1. Incomplete report (“Login broken”)
2. Clear duplicate of another bug
3. New regression
4. High-quality complete report
5. Multi-component issue
6. Environment-specific bug
7–12. Variations for embedding search quality

Also create `components.json` with 8–10 realistic components (Auth, Payments, Dashboard, Notifications, API Gateway, etc.) and assign owners.

---

## 9. Demo Mode Requirements

- Route: `/demo`
- Buttons for 4 scenarios:
  1. Incomplete Report
  2. Duplicate Detection
  3. Successful Reproduction
  4. Full Pipeline + Routing
- Each scenario auto-fills a bug and runs the pipeline
- Selenium evidence must be reliable (pre-recorded or mocked in demo mode)
- Progress must be visible in real time

---

## 10. Implementation Priority (Follow This Order)

### Phase 1 – Foundation
1. Database models + Alembic migrations
2. Auth (register/login/me)
3. Basic Bug CRUD
4. Seed sample data + components

### Phase 2 – Core Agents
5. LLM service + structured output helpers
6. Triage Agent
7. Intelligence Agent (embeddings + Chroma)
8. Orchestrator (sequential execution)

### Phase 3 – UX & Real-time
9. Bug submission page
10. SSE streaming progress
11. Clarification chat loop
12. Bug detail page with all agent outputs

### Phase 4 – Advanced
13. Reproduction Agent (script generation + mock/live Selenium)
14. Routing Agent
15. Feedback system
16. Demo page
17. Admin page

---

## 11. Environment Variables (.env.example)

```env
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/bugtriage
GROQ_API_KEY=...
OPENAI_API_KEY=...                  # optional fallback
CHROMA_PATH=./chroma_db
SECRET_KEY=your-secret-key
DEMO_MODE=true

# Frontend
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 12. Acceptance Criteria (Definition of Done)

- [ ] User can register and login
- [ ] User can submit a raw or structured bug report
- [ ] Triage Agent correctly detects missing fields and asks questions
- [ ] User can answer questions and pipeline continues
- [ ] Intelligence Agent returns relevant duplicates with scores
- [ ] Component suggestions appear with reasoning
- [ ] Full triage report is stored and visible
- [ ] Demo mode runs 4 scenarios without failure
- [ ] Developers can see assigned bugs and leave feedback
- [ ] All agent decisions are logged in `AgentAction`
- [ ] Real-time progress is visible via SSE
- [ ] Docker Compose brings the whole stack up with one command

---

## 13. Coding Guidelines for Cursor / Antigravity

1. Always use **structured JSON output** from LLMs (use Pydantic models).
2. Every agent must return a `reasoning` field.
3. Never hardcode API keys.
4. Use async wherever possible in FastAPI.
5. Prefer Server-Sent Events over WebSockets for progress.
6. Keep Selenium behind a `DEMO_MODE` or `ENABLE_LIVE_SELENIUM` flag.
7. Write type hints everywhere.
8. Create Pydantic schemas for every request/response.
9. Log every agent call to the database.
10. Make the UI clean and modern (use shadcn/ui components).

---

## 14. Quick Start Commands (for README)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
pnpm install
pnpm dev

# Full stack
docker-compose up --build
```

---

**End of PRD**

This document is the single source of truth.  
When implementing with Cursor or Antigravity, always refer back to the agent contracts, database models, API endpoints, and implementation priority order defined above.
```
