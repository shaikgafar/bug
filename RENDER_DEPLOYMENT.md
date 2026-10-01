# Deploying BugTriage.ai to Render (render.com)

This guide walks you through deploying **BugTriage.ai** to [Render](https://render.com) using the included **`render.yaml` Blueprint** (1-Click multi-service deployment) or manual configuration.

---

## Architecture on Render

```
                               ┌────────────────────────────────┐
                               │  Render Managed PostgreSQL DB  │
                               │        (bugtriage-db)          │
                               └───────────────▲────────────────┘
                                               │
                                       DATABASE_URL
                                               │
┌─────────────────────────────┐        ┌───────┴────────────────┐
│   Render Web Service #1     │        │  Render Web Service #2 │
│    `bugtriage-frontend`     ├───────►│  `bugtriage-backend`   │
│   Next.js 14 (App Router)   │ NEXT_  │     FastAPI + Agents   │
│                             │ PUBLIC_│                        │
│ https://frontend.onrender...│ API_URL│ https://backend.onrender...
└─────────────────────────────┘        └────────────────────────┘
```

---

## Method 1: Automated 1-Click Blueprint (Recommended)

Render provides **Blueprints** using Infrastructure as Code (`render.yaml`). This automatically provisions:
1. **Managed PostgreSQL Database** (`bugtriage-db`)
2. **Backend Web Service** (`bugtriage-backend` - FastAPI Python 3.11)
3. **Frontend Web Service** (`bugtriage-frontend` - Next.js 14)
4. Wire-up of all environment variables (`DATABASE_URL`, `NEXT_PUBLIC_API_URL`, `SECRET_KEY`, etc.)

### Step 1: Push Your Code to GitHub or GitLab
In your local project terminal (`c:\aimihack`), create a new repository on [GitHub](https://github.com/new) (e.g. `bugtriage-ai`), then run:

```bash
# Rename branch to main if needed
git branch -M main

# Add your GitHub remote URL
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git

# Push the committed code
git push -u origin main
```

### Step 2: Deploy on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click the **"New +"** button in the top navigation bar.
3. Select **"Blueprint"**.
4. Connect your GitHub/GitLab account and select your repository (`bugtriage-ai`).
5. Render will automatically detect [`render.yaml`](file:///c:/aimihack/render.yaml) and display the plan:
   - **Database**: `bugtriage-db` (Free tier PostgreSQL)
   - **Backend**: `bugtriage-backend` (Web Service, Python 3.11)
   - **Frontend**: `bugtriage-frontend` (Web Service, Node 20)
6. (Optional) Provide API keys if you wish to use live LLMs:
   - `GROQ_API_KEY` (Optional, for live Groq LPU inference)
   - `OPENAI_API_KEY` (Optional fallback)
   - If left blank, the platform automatically runs in deterministic demo mode (`DEMO_MODE=true`), which works 100% offline without any API keys!
7. Click **"Apply"**.
8. Render will provision the database, install backend dependencies, run database migrations (`alembic upgrade head`), build the Next.js frontend, and launch both services!

---

## Method 2: Manual Dashboard Setup (Step-by-Step)

If you prefer to configure each service manually in the Render UI:

### 1. Create PostgreSQL Database
1. Go to **New +** → **PostgreSQL**.
2. Name: `bugtriage-db`
3. Database: `bugtriage`
4. User: `bugtriage_user`
5. Region: Pick the region closest to you (e.g., Oregon or Frankfurt).
6. Plan: **Free**.
7. Click **Create Database**.
8. Copy the **Internal Database URL** (e.g., `postgres://bugtriage_user:...@dpg-...-a/bugtriage`).

### 2. Create Backend Web Service (FastAPI)
1. Go to **New +** → **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Name**: `bugtriage-backend`
   - **Region**: Same region as your database
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
4. Add **Environment Variables**:
   | Key | Value | Notes |
   |---|---|---|
   | `DATABASE_URL` | *Paste Internal Database URL from Step 1* | Supports `postgres://` or `postgresql://` |
   | `SECRET_KEY` | *Click 'Generate' or enter 32+ random characters* | JWT signing secret |
   | `DEMO_MODE` | `true` | Allows zero-API-key demo scenarios |
   | `ENABLE_LIVE_SELENIUM` | `false` | Mock/pre-recorded evidence for cloud sandboxes |
   | `PYTHON_VERSION` | `3.11.9` | Ensures exact Python runtime |
   | `GROQ_API_KEY` | *(Optional)* | For live Groq inference |
5. Click **Create Web Service**.
6. Note the deployed backend URL (e.g. `https://bugtriage-backend.onrender.com`).

### 3. Create Frontend Web Service (Next.js)
1. Go to **New +** → **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Name**: `bugtriage-frontend`
   - **Region**: Same region as your backend
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start -- -p $PORT`
   - **Plan**: `Free`
4. Add **Environment Variables**:
   | Key | Value | Notes |
   |---|---|---|
   | `NEXT_PUBLIC_API_URL` | `https://bugtriage-backend.onrender.com` | URL of your deployed backend |
   | `NEXTAUTH_SECRET` | *Click 'Generate'* | NextAuth session secret |
   | `NODE_VERSION` | `20.12.0` | Node.js version |
5. Click **Create Web Service**.

---

## Verifying the Deployment

1. **Backend Health Check**:
   Open `https://bugtriage-backend.onrender.com/` in your browser. You should receive:
   ```json
   {
     "project": "Intelligent Software Bug Triage Agent",
     "version": "2.0.0",
     "status": "online",
     "docs_url": "/docs",
     "api_prefix": "/api",
     "agents": [
       "Triage Agent",
       "Intelligence Agent",
       "Reproduction Agent",
       "Routing & Analysis Agent"
     ]
   }
   ```
2. **Backend Interactive Swagger Docs**:
   Open `https://bugtriage-backend.onrender.com/docs` to test endpoints directly.

3. **Frontend Application**:
   Open `https://bugtriage-frontend.onrender.com/demo` and test the 4 showcase scenarios with live Server-Sent Events (SSE) streaming!

---

## Important Render Tips
- **Free Tier Inactivity Sleep**: On the Render Free tier, web services spin down after 15 minutes of inactivity. When accessed again, the first request takes ~30-50 seconds to wake up. This is standard behavior on Render Free instances.
- **Dynamic Port Binding**: Render assigns a dynamic port via `$PORT` (typically 10000). Both `render.yaml` and the Dockerfiles have been configured to bind to `${PORT:-8000}` and `${PORT:-3000}` automatically.
- **PostgreSQL Scheme**: Render uses `postgres://` for database connection strings. The backend database layer (`app/database.py`) has been configured to automatically normalize `postgres://` to `postgresql+asyncpg://` for async queries and `postgresql://` for Alembic migrations.
