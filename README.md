# HubSpot Bidirectional Data Synchronization Tool

A full-stack application designed to synchronize contact data between a custom Node.js application and HubSpot CRM. This project demonstrates robust backend architecture, queue management for background tasks, and conflict resolution strategies.

## 🚀 Architecture Overview

The system uses a **Bidirectional Sync** approach:

1.  **Local to HubSpot**: When a contact is created or updated locally, a job is added to a **Bull Queue**. The worker processes this job asynchronously, pushing changes to HubSpot.
2.  **HubSpot to Local**:
    *   **Webhooks**: HubSpot triggers an endpoint on our server when data changes.
    *   **Polling (Fallback)**: A cron job runs every 5 minutes to fetch recent changes if webhooks miss.
3.  **Conflict Resolution**:
    *   If `Local.lastModified > HubSpot.lastModified` (and we are pulling HS data), we flag it as a **Conflict**.
    *   Conflicts are stored in MongoDB and require manual resolution via the Frontend Dashboard.
    *   This ensures NO data is auto-overwritten if there is ambiguity.

## 🛠 Tech Stack

*   **Backend**: Node.js, Express, MongoDB, Bull (Redis), Axios.
*   **Frontend**: React (Vite), Pure CSS (Premium Glassmorphism Design).
*   **Infrastructure**: Redis (for Queues).

## 📂 Folder Structure

```
backend/
 ├── controllers/   # Request logic
 ├── models/        # Mongoose Schemas (Contact, Conflict)
 ├── queues/        # Bull Queue Setup
 ├── services/      # HubSpot API Interaction Layer
 ├── workers/       # Sync Logic & Conflict Detection
 ├── webhooks/      # (Integrated in server.js for simplicity)
 ├── utils/         # DB Connection & Rate Limiting wrappers
 └── server.js      # Entry point

frontend/
 ├── src/pages/     # Dashboard & Conflict Screens
 ├── src/services/  # API calls
 └── src/          # Components & Global Styles
```

## ⚡ Setup & Run

### Prerequisites
*   Node.js (v14+)
*   MongoDB (Running locally on 27017)
*   Redis (Running locally on 6379) - **Required for Queues**

### 1. Backend Setup
```bash
cd backend
npm install
# Update .env with your HubSpot Access Token
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
1.  Open `http://localhost:5173`.
2.  Create a contact via Postman (API) or wait for HubSpot sync.
    *   *(Note: UI for creating contacts was simplified out for dashboard focus, but backend supports it).*
3.  Modify data in HubSpot.
4.  Watch the Dashboard update live.
5.  Create a conflict (Edit both sides simultaneously) and resolve it in the "Conflicts" tab.

## 🛡 Strategies

### Rate Limiting
We use a wrapper around Axios that:
*   Adds a small delay (200ms) between requests.
*   Automatically retries 3 times on `429 Too Many Requests` errors with exponential backoff.

### Error Handling
*   All async operations are wrapped in `try/catch`.
*   Sync jobs are retried automatically by Bull if they fail (e.g., network issues).
*   Failed syncs are logged and viewable on the Dashboard.

### Limitations
*   Polling is set to just log for demonstration (to avoid API quota usage without a real key).
*   Authentication is skipped for simplicity.

---
*Built for Clarity & Reliability.*
