# MediQueue — Interview Prep

**Resume says React. Project uses Next.js under the hood. That's fine — Next.js is React. Say "React" in the interview. Only mention Next.js if they ask directly.**

---

## Final Intro Script (~45–50 sec) — USE THIS

**Do NOT mention in intro:** priority queue, doctor call-next. (Only if they ask later.)

> MediQueue is a hospital OPD queue management system.
>
> I got the idea when I noticed patients waiting in long queues at government hospitals and private clinics — sometimes for hours, with no idea when their turn would come.
>
> I built MediQueue to solve that. The receptionist registers the patient and generates a department-wise token. Instead of standing in line, patients can track their position from their own device and wait freely. Display boards get live updates automatically — no manual refresh.
>
> For the frontend, I used React. For the backend, Node.js and Express with REST APIs. PostgreSQL stores patient and token data. For real-time sync, I used Redis Pub/Sub with Server-Sent Events so every connected screen updates instantly. I also integrated Gemini to suggest the right department based on the patient's symptoms.
>
> As a future enhancement, I'd add push notifications — when a patient's turn is near, they get alerted on their phone.

**Done. Stop talking. Let them ask questions.**

---

## Short Version (~25 sec)

> MediQueue is a hospital OPD queue system. Reception registers patients and generates department-wise tokens. Patients track their position from their phone, and display boards update live via Redis and SSE. Built with React, Node.js, Express, PostgreSQL, and Gemini for department suggestion.
---

## React on Resume (if they dig in)

| They ask | You say |
|---|---|
| "You used React?" | "Yes — components, useState, useEffect, Context for toasts, axios for API calls." |
| "Next.js or React?" | "React for all UI logic. Next.js was just the project setup for routing and folder structure. Same components would work with React Router." |
| "React vs Next.js?" | "React is the UI library. Next.js is a framework on top of React with routing built in. My focus was React — state, hooks, component composition." |

**React concepts you actually used:**

| Concept | Where |
|---|---|
| `useState` | Forms, queue list, loading/error |
| `useEffect` | API calls, SSE connection, cleanup |
| `useRef` | EventSource on display board |
| Context | `ToastContext` |
| Reusable components | `Button`, `Card`, `Modal`, `Table`, etc. |

---

# H — How It Started (details if asked)

**Problem**

| Issue | Impact |
|---|---|
| Paper tokens | Lost tokens, no tracking |
| No priority | Emergency patients wait in line |
| Manual display board | Stale info, extra staff work |
| Wrong department | Patient sent to wrong OPD |
| No visibility | Patients don't know wait time |

**Users:** Reception · Doctor · Display board · Patient (track) · Admin

---

# E — Engineering (details if asked)

```
React  →  Express + TypeScript  →  PostgreSQL
              ↓
           Redis (pub/sub)  →  SSE  →  live UI
              ↓
           Gemini AI (triage)
```

### Why each tech

| Tech | Why this | Why not the alternative |
|---|---|---|
| **React** | Components, hooks, real-time UI updates | Angular/Vue — smaller ecosystem for jobs I was targeting |
| **Tailwind** | Fast consistent UI | Plain CSS — slower for dashboards |
| **Node + Express** | Same language as frontend, simple REST API | NestJS — overkill for this scope; Express teaches fundamentals |
| **TypeScript** | Type safety with Drizzle | Plain JS — more runtime bugs |
| **PostgreSQL** | Relational data (patient → token → logs), transactions | MongoDB — weak for strict relationships and unique token numbers |
| **Drizzle** | Type-safe, lightweight ORM | Prisma — heavier; raw SQL — no types |
| **Redis + SSE** | One-way server → client updates, scales across instances | WebSocket — overkill when client doesn't need to push; polling — slow |
| **Gemini** | Free tier, good JSON output | OpenAI — paid for a learning project |

### Backend layers

`Routes → Controllers → Application Flows → Services → Database`

### Token lifecycle

`WAITING → IN_PROGRESS → DONE / SKIPPED`

### Priority order

`EMERGENCY (3) > SENIOR (2) > NORMAL (1)` — same priority = FIFO by `createdAt`

---

# R — Results (details if asked)

Keep answers short: **what → how → result**

| Feature | How | Result |
|---|---|---|
| **Registration + token** | Form → `POST /patient/register` → patient + token in one DB transaction | Digital record, unique token per dept (e.g. `DENT-001`) |
| **Priority queue** | Sort by priority score, then `createdAt` in `queue.service.ts` | Emergency and seniors don't get stuck behind normal cases |
| **Doctor dashboard** | `POST /queue/call-next` / `complete` → transaction → `notifyQueueUpdate()` | One-click workflow, display syncs automatically |
| **Live display** | `EventSource` on `GET /queue/stream/:dept` + Redis broadcast | No refresh, multiple screens stay in sync |
| **Token tracking** | `GET /token/track/:tokenNumber` → position in queue | Patients see how many are ahead |
| **AI triage** | `POST /patient/suggest` → Gemini → Zod validate → `triageRules.ts` fallback | Faster registration; system works even if AI is down |
| **Admin dashboard** | `GET /admin/stats` → charts in React state | Overview of patients and departments |

**End-to-end:** Register → token → display shows queue → patient tracks → doctor calls next → board updates → doctor marks done → admin sees stats.

---

# O — Opportunities (details if asked)

| Timeline | What |
|---|---|
| **Short term** | JWT auth, SMS/WhatsApp alerts, multi-doctor per department, appointments |
| **Medium term** | Cloud deploy, multi-clinic tenants, wait-time analytics, PWA |
| **Long term** | Microservices, horizontal scaling (Redis already supports it), HMS integration |

**Scaling one-liner:** "Redis pub/sub lets multiple backend instances broadcast queue changes. I'd add read replicas for PostgreSQL and CDN for the frontend as load grows."

---

## Q&A — Short Answers

**Hardest part?**
Priority queue + real-time sync. Sorting EMERGENCY > SENIOR > NORMAL while pushing live updates via Redis + SSE.

**Real-time how?**
Queue changes → Redis publish → subscriber → all SSE clients. Display uses `EventSource`, no polling.

**SSE vs WebSocket?**
One-way only (server → display). SSE is simpler and enough here.

**AI role?**
Routing assistant only — suggests department + priority. Rules override for emergencies. Fallback if Gemini fails.

**Transactions where?**
Patient + token registration together. Token complete + log entry together. Keeps data consistent.

**React state?**
`useState` for local state, Context for toasts. SSE updates call `setQueue` → UI re-renders. No Redux needed.

**useEffect where?**
Fetch on mount, SSE setup + `es.close()` cleanup, live clock interval.

---

## Q&A — Scalability

**How would you scale this system?**
Right now it's a monolith — fine for one clinic. To scale: run multiple backend instances behind a load balancer, Redis pub/sub already broadcasts queue updates to all instances so every SSE client gets updates. Add PostgreSQL read replicas for heavy read queries (display board, tracking). Put the React frontend on a CDN. Connection pooling on the database so many concurrent requests don't exhaust connections.

**Why is Redis important for scaling?**
Without Redis, if you have 2 backend servers, a queue update on server A wouldn't reach SSE clients connected to server B. Redis pub/sub acts as a message bus — any instance publishes, all instances get it and push to their connected clients.

**What if 10 clinics use the same system?**
Multi-tenant architecture — add a `clinicId` on patients and tokens. Every API filters by clinic. Each clinic gets its own departments and queues. Admin dashboard scoped per clinic. Could use separate Redis channels per clinic to avoid cross-clinic noise.

**What if SSE connections spike (many display boards + patients tracking)?**
SSE is lightweight compared to WebSocket — one HTTP connection per client. Scale backend horizontally. Use a sticky session or shared Redis so any instance can push updates. For very high load, could add a dedicated notification service. Set connection limits and heartbeat timeouts so dead connections don't pile up.

**Would you move to microservices?**
Not yet — the monolith is simpler to develop and deploy for this size. If it grew, I'd split naturally: queue service (core logic), notification service (SMS/SSE), AI triage service (Gemini calls). Redis already decouples real-time broadcasting, so that boundary exists.

**How would you deploy to production?**
Frontend on Vercel or Netlify. Backend on Railway, Render, or AWS ECSS. Managed PostgreSQL (Supabase, RDS). Managed Redis (Upstash, ElastiCache). Environment variables for API keys. CI/CD with GitHub Actions — test, build, deploy on merge.

**Database bottlenecks?**
Most writes happen at registration and call-next — not thousands per second for a clinic. Reads are heavier (display board, tracking). Index on `department + status + priority` for queue queries. Read replicas if many clinics share one DB. Archive old DONE tokens so the waiting queue query stays fast.

---

## Q&A — Challenges & How You Solved Them

**What was the hardest part?**
Combining priority queue logic with real-time updates. Simple FIFO is easy — but EMERGENCY > SENIOR > NORMAL sorting, plus pushing that sorted list live to every connected display without polling, took the most design thought.

**Challenge: priority queue isn't just FIFO**
Real hospitals need emergencies first, then seniors, then everyone else — but within the same priority, first-come-first-served. I solved it with a priority score (3, 2, 1) and sort by score then `createdAt`. Lives in `queue.service.ts` → `getQueue()`.

**Challenge: display board must update instantly**
Polling every few seconds feels laggy and wastes server resources. I used SSE — backend pushes queue JSON when anything changes. Redis pub/sub decouples the API from connected clients so the flow stays clean.

**Challenge: patient + token must save together**
If token generation fails after patient insert, you'd have orphan records. Wrapped both in a single database transaction — both succeed or both roll back.

**Challenge: what if two staff act on the queue at the same time?**
Call-next runs inside a database transaction — fetch top waiting token and update status in one atomic step. Only tokens with status WAITING get picked. For production I'd add auth so each department has controlled access.

**Challenge: AI API can fail or be slow**
Gemini might timeout or return bad JSON. Built a rule-based fallback (`triageRules.ts`) — regex for Hindi/English keywords, age-based senior override, emergency keyword detection. System never depends 100% on AI.

**Challenge: validating AI output**
LLMs can return unexpected formats. Used Zod schema to validate Gemini's JSON response before using it. Invalid response → fall back to rules.

**Challenge: SSE connection drops (network blip)**
Browser `EventSource` auto-reconnects by default. On reconnect, client can also fetch the current queue via REST as a fallback so the board never stays stale for long.

**Challenge: unique token numbers per department**
Format `DENT-001`, `CARD-015` — need sequential numbers without duplicates. Token service counts existing tokens for that department and increments. Done inside registration transaction so numbers stay consistent.

**Challenge: frontend feels slow while waiting for API**
Added loading states, skeleton UI, and toast notifications so the user always knows what's happening. Disabled submit buttons during API calls to prevent double registration.

**What would you do differently if you started again?**
Add JWT auth from day one. Write API integration tests for queue flows. Maybe use React Query for caching and refetching instead of raw axios in every component.

---

## Q&A — Architecture & Design

**Why layered backend (routes → controllers → flows → services)?**
Separation of concerns. Routes only define URLs. Controllers parse requests. Flows orchestrate multi-step business logic (register patient + generate token). Services handle DB operations. Easy to test services independently and easy to explain in an interview.

**Why REST and not GraphQL?**
Clear endpoints map to actions — register, call next, track token. GraphQL adds complexity this project doesn't need. REST is simpler for a CRUD + action-based API like queue management.

**Why transactions?**
When two DB operations must succeed or fail together — patient + token on registration, status update + log on complete. Transactions keep data consistent if something fails mid-way.

**How do you handle errors on the backend?**
Controllers catch errors, return proper HTTP status codes (400 for bad input, 404 for missing token, 500 for server errors). Frontend shows toast messages so staff see what went wrong.

**How does CORS work here?**
Backend allows requests from the frontend origin (localhost:3000 in dev). In production, restrict to the deployed frontend domain only.

**Why Drizzle over Prisma?**
Lighter, SQL-like syntax, great TypeScript inference. For a project where I wanted to understand the actual queries, Drizzle felt closer to SQL without going fully raw.

**Why PostgreSQL over MongoDB?**
Strong relationships — patient has tokens, tokens have logs. Need unique constraints on token numbers. Priority sorting and filtering fit SQL well. Hospital systems are inherently relational.

**Is the AI making medical decisions?**
No. It's a routing assistant only — suggests which OPD department and priority level. Emergency rules always override AI. Reception confirms before registering. Not a diagnosis tool.

**How does token tracking calculate position?**
Fetch all WAITING tokens for that department, sort by priority + time, find index of the patient's token. Return status + position + how many ahead.

**What data do you store in logs?**
Token activity — when called, when completed. Helps admin dashboard and future analytics (average wait time, etc.).

---

## Q&A — Security & Production Readiness

**Is it production-ready?**
Core flows work end-to-end. For real hospital use I'd still add: JWT authentication, role-based access (reception can't call next), HTTPS everywhere, rate limiting on public track API, input sanitization, and audit logs.

**How would you add authentication?**
JWT on login — token in header for protected routes. Middleware checks role: reception, doctor, admin. Public routes only for token tracking and display board (or display behind clinic PIN).

**Security concerns today?**
APIs are mostly open in dev — fine for demo, not for production. Would lock down write endpoints (register, call next) behind auth. Never expose Gemini API key on frontend — it stays on backend only.

**How do you protect patient data?**
Phone and complaint are sensitive. Production needs HTTPS, encrypted DB at rest, role-based access so doctors only see their department queue, and possibly mask phone numbers on display board (show only token + name initial).

**Rate limiting?**
Public track endpoint could be abused. Add rate limiting per IP (express-rate-limit or Redis-based) — especially on `/patient/suggest` (AI costs money per call).

---

## Q&A — Failure Scenarios

**What if Redis goes down?**
Queue still works via REST — register, call next, fetch queue manually. Only live SSE updates break. Display board falls back to periodic REST fetch until Redis is back. In production, use managed Redis with failover.

**What if PostgreSQL goes down?**
Nothing works — it's the source of truth. Use managed PostgreSQL with automated backups, connection retry logic, and health check endpoint so the load balancer knows to stop routing traffic.

**What if Gemini API is down?**
Rule-based fallback kicks in automatically. Registration still works — reception picks department manually or gets rule-based suggestion. Zero downtime from AI failure.

**What if SSE client disconnects?**
EventSource reconnects automatically. Display page can also refetch queue on reconnect event so UI catches up.

**What if backend crashes mid-registration?**
Transaction rolls back — no half-created patient without token. Client shows error toast, reception retries.

---

## Q&A — React & Frontend (extra)

**Why no Redux?**
App size doesn't need it. Local `useState` for page-level state, Context for toasts. SSE pushes queue updates directly into state. Adding Redux would be over-engineering.

**How does the display board update without refresh?**
`useEffect` opens an `EventSource` to the SSE stream. On each message, `setQueue(parsedData)` triggers re-render. Cleanup closes connection on unmount.

**How do you prevent memory leaks?**
Return cleanup from `useEffect` — close EventSource, clear intervals. Important on display board which runs for hours on a TV.

**Component structure?**
Pages in `app/` folder (reception, doctor, display, admin, track). Shared UI in `components/ui/`. Layout components for sidebar/navbar. Keeps pages thin, components reusable.

**How do forms work?**
Controlled inputs — each field tied to `useState`. On submit, axios POST to backend. Loading state disables button. Toast on success/error.

---

## Q&A — Testing & DevOps (if asked)

**How would you test this?**
Unit tests for priority sorting logic in `getQueue()`. Integration tests for register → token created, call next → status changes. Manual E2E for SSE — register on reception, verify display updates. Could add Playwright for frontend flows.

**How do you manage environment variables?**
Backend: `DATABASE_URL`, `REDIS_URL`, `GEMINI_API_KEY`, `PORT`. Frontend: `NEXT_PUBLIC_API_URL`. Never commit `.env` — use `.env.example` for documentation.

**CI/CD pipeline?**
GitHub Actions: on PR → lint + typecheck + run tests. On merge to main → deploy backend and frontend separately. Run DB migrations before backend starts.

---

## Tech Stack (one glance)

| Layer | Stack |
|---|---|
| Frontend | React, Tailwind |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Drizzle |
| Real-time | Redis, SSE |
| AI | Gemini + rule fallback |

---

## Demo

```bash
cd backend && npm run dev    # :3001
cd frontend && npm run dev   # :3000
cd backend && npm run seed   # first time only
```

1. `/reception` — register patient, see AI suggestion  
2. `/display` — live queue board  
3. `/doctor` — call next → watch display update  
4. `/track/CARD-001` — patient position  
5. `/admin` — stats  

---

**Practice:** Say the 90-second HERO script out loud twice. Time yourself. If it's over 2 minutes, cut words. Interviewers want clarity, not a lecture.
