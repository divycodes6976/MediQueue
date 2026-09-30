# 🏥 MediQueue — Hospital OPD Queue Management System

A modern, real-time Outpatient Department (OPD) queue management system designed to eliminate physical waiting lines, streamline patient triage with AI assistance, and synchronize doctor consoles and waiting area displays in real time.

---

## 📌 Project Overview

In traditional hospital Outpatient Departments, crowded waiting areas, manual paper tokens, and lack of live queue visibility cause frustration for both patients and healthcare staff. Emergency cases frequently get stuck behind routine checkups, and receptionists can inadvertently route patients to the incorrect specialist department.

**MediQueue** digitizes and automates the entire OPD journey:
- **Smart Reception Registration**: Registers patients and leverages Google Gemini AI to analyze symptoms and automatically suggest the correct medical department and priority tier.
- **Priority-Weighted Queue**: Automatically prioritizes emergency cases and senior citizens over routine visits, while preserving first-come, first-served order within each tier.
- **Concurrency-Safe Doctor Console**: Doctors can call the next patient safely without race conditions, using PostgreSQL advisory locks and atomic transactions.
- **Zero-Latency Live Display**: Waiting room screens automatically update in real time via Redis Pub/Sub and Server-Sent Events (SSE)—no page refreshes needed.
- **Self-Service Token Tracking**: Patients can track their live position in queue from their mobile phones.

---

## 🚀 Key Features & Modules

| Module | Route | Description |
|---|---|---|
| **Live Display Board** | `/display` | Real-time queue board designed for waiting room TV screens, separated by department. |
| **Reception Dashboard** | `/reception` | Patient check-in, AI symptom triage suggestion, and priority token generation. |
| **Doctor Console** | `/doctor` | Department queue view, concurrency-safe "Call Next", "Mark Done", and "Skip" controls. |
| **Patient Tracker** | `/track` / `/track/:token` | Mobile-friendly token tracking showing current status and patients ahead. |
| **Staff Authentication** | `/login` / `/signup` | Secure credential-based access for hospital staff and administrators. |

---

## 🔄 System Flow

```
Patient Arrival ➡️ Reception (AI Triage) ➡️ Token Issued ➡️ Live Queue Display (SSE)
                                                                    ⬇️
Patient Treated ⬅️ Doctor Console ("Call Next" with DB Lock) ⬅️ Priority Queue
```

![MediQueue main flow](docs/diagrams/flow-simple.png)

### Real-Time Synchronization Architecture

Whenever queue data changes (a patient is registered, called, or marked completed), the backend publishes an event to Redis, which pushes instant updates to all connected browser displays via Server-Sent Events (SSE).

```
Backend API ──▶ Redis Pub/Sub ──▶ SSE Bridge ──▶ Connected Displays & Consoles
```

![Real-time synchronization flow](docs/diagrams/realtime-sync.svg)

### Concurrency Safety & Fair Queuing

- **Advisory Locks**: PostgreSQL transactions and table-level advisory locks prevent race conditions when multiple doctors in the same department attempt to call the next patient simultaneously.
- **Multi-Tier Priority Sorting**:
  1. `EMERGENCY` (Highest priority)
  2. `SENIOR` (Age 60+)
  3. `NORMAL` (Standard checkup)
  *(Within each tier, patients are served first-come, first-served based on arrival timestamp).*
- **AI-Assisted Triage with Fallback**: Receptionists input patient symptoms in natural language (English or Hindi). Gemini AI suggests the target department (`GEN`, `CARD`, `ORTH`, `NEUR`, `DENT`) and priority. If the AI service is unavailable or offline, an automated regex rule-based engine takes over seamlessly.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router, Lucide Icons, Framer Motion |
| **Backend** | Node.js, Express.js (REST API) |
| **Database & ORM** | PostgreSQL, Drizzle ORM |
| **Real-Time Engine** | Redis Pub/Sub, Server-Sent Events (SSE) |
| **AI Integration** | Google Gemini API (`@google/genai`) with rule-based fallback |
| **Validation** | Zod |

---

## 💻 How to Use & Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (running locally or cloud instance)
- [Redis](https://redis.io/) (running locally or cloud instance e.g., Upstash / Aiven)
- Git

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/MediQueue.git
cd MediQueue
```

---

### Step 2: Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory (you can copy `.env.sample`):
   ```env
   PORT=3001
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mediqueue
   REDIS_URL=redis://localhost:6379

   # Google Gemini (Optional - rule-based fallback active if omitted)
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.0-flash
   ```

4. **Seed the Database**:
   Populate initial departments and demo staff accounts:
   ```bash
   npm run seed
   ```

5. **Start the Backend Server**:
   ```bash
   npm run dev
   ```
   *The backend REST API will start on `http://localhost:3001`.*

---

### Step 3: Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   *The frontend application will be accessible at `http://localhost:3000`.*

---

### Step 4: Using the Application

1. **Live Display Board (`http://localhost:3000/display`)**:
   - Open this on any screen or TV in the waiting area.
   - Displays the current token being served and upcoming tokens organized by department. Updates live without refreshing.

2. **Reception Desk (`http://localhost:3000/reception`)**:
   - Enter patient name, age, gender, and chief complaints / symptoms.
   - Click **Suggest** to let AI analyze the symptoms and recommend the appropriate department and priority tier.
   - Click **Generate Token** to register the patient. A token (e.g., `CARD-001`, `ORTH-002`) is generated and instantly broadcast to the display board.

3. **Doctor Console (`http://localhost:3000/doctor`)**:
   - Select your department.
   - View the live waiting queue sorted by priority.
   - Click **Call Next** to call the next patient.
   - When the consultation concludes, click **Complete** or **Skip**.

4. **Patient Token Tracking (`http://localhost:3000/track`)**:
   - Patients enter their token number (e.g., `DENT-001`) to view real-time status, department details, and how many patients are ahead of them.

---

## 📂 Project Directory Structure

```
MediQueue/
├── backend/
│   ├── src/
│   │   ├── config/             # Database (Drizzle), Redis, and schema definitions
│   │   ├── controllers/        # Express route controllers
│   │   ├── events/             # Redis Pub/Sub subscriber and SSE bridges
│   │   ├── middleware/         # Auth & error-handling middleware
│   │   ├── routes/             # REST API endpoints (/patient, /token, /queue, etc.)
│   │   ├── services/           # Business logic (queue, token generation, AI triage)
│   │   ├── utils/              # SSE connection store, rule-based triage fallback
│   │   ├── index.js            # Express application entry point
│   │   └── seed.js             # Initial database seeder
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Shared UI components, layout shell, navbar, sidebar
│   │   ├── contexts/           # Toast context & UI state
│   │   ├── pages/              # Reception, Doctor, Display, Track, Auth pages
│   │   ├── App.jsx             # Main routing configuration
│   │   └── main.jsx            # Application root
│   ├── vite.config.js          # Vite config with backend proxy
│   └── package.json
│
├── docs/
│   └── diagrams/               # Visual architecture and flow diagrams
├── README.md                   # Project documentation
└── .gitignore                  # Git ignore rules
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
