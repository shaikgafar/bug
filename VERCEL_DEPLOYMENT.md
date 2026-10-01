# Deploying BugTriage.ai to Vercel (vercel.com)

Vercel is the native cloud platform built by the creators of **Next.js**. Deploying the frontend to Vercel gives you:
- **Global Edge Network (CDN)** with ultra-fast sub-50ms page load speeds.
- **Automatic SSL certificates** on `*.vercel.app` domains.
- **Zero-config build and deployment** directly from your GitHub repository.

---

## 1-Click Deploy via Vercel Dashboard

### Step 1: Open Vercel Project Importer
Navigate directly to:
👉 **[https://vercel.com/new](https://vercel.com/new)**

### Step 2: Import Your GitHub Repository
1. In the **"Import Git Repository"** section, locate or search for:
   **`shaikgafar/bug`**
2. Click the **"Import"** button next to it.

### Step 3: Configure Project Settings (IMPORTANT)
Because this is a full-stack repository with both `frontend` and `backend`, set the **Root Directory**:

1. Under **"Project Name"**, leave as `bug` or enter `bugtriage-ai`.
2. Locate the **"Root Directory"** option.
3. Click **"Edit"**.
4. Select or type: **`frontend`**
5. Click **"Continue"**.
6. **Framework Preset**: Vercel will automatically detect **Next.js**.

### Step 4: Environment Variables (Optional)
Expand the **"Environment Variables"** dropdown:
| Key | Value | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | *Your Render Backend URL* (e.g. `https://bugtriage-backend.onrender.com`) | Connects Next.js UI to live FastAPI multi-agent engine |
| `NEXTAUTH_SECRET` | *Any random 32+ character string* | Signs session tokens |

> **Note:** If you haven't deployed the backend yet or want to showcase the interactive presentation videos and demo UI first, you can leave `NEXT_PUBLIC_API_URL` empty—the UI and interactive video modal system will run smoothly out of the box!

### Step 5: Click "Deploy"
Click the **"Deploy"** button. 
Vercel will run `npm install && npm run build` and launch your live application at `https://<project-name>.vercel.app` in under 60 seconds!

---

## Deploying Using Vercel CLI (Alternative)

If you prefer deploying from your terminal using Vercel CLI:

```bash
# Navigate to the frontend directory
cd frontend

# Run Vercel deploy
npx vercel

# Follow the quick interactive prompts:
# ? Set up and deploy "~/aimihack/frontend"? [Y/n] y
# ? Which scope do you want to deploy to? <Your Account>
# ? Link to existing project? [y/N] n
# ? What’s your project’s name? bugtriage-frontend
# ? In which directory is your code located? ./

# For production deployment:
npx vercel --prod
```

---

## Full-Stack Architecture (Vercel + Render)

```
┌────────────────────────────────────────┐
│             VERCEL (Edge)              │
│       Frontend: Next.js 14 App         │
│     https://bugtriage.vercel.app       │
└───────────────────┬────────────────────┘
                    │
                    │ REST API & Server-Sent Events (SSE)
                    │ via NEXT_PUBLIC_API_URL
                    ▼
┌────────────────────────────────────────┐
│             RENDER (Cloud)             │
│      Backend: FastAPI Python 3.11      │
│  ChromaDB Vector Store + Agents + DB   │
│   https://bugtriage-backend.onrender...│
└────────────────────────────────────────┘
```
