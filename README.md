# HubSpot Bidirectional Data Synchronization Tool

A full-stack application for keeping contacts and companies in sync between a custom application and HubSpot CRM.

## 📋 Overview

This tool enables bidirectional data synchronization between a local MongoDB database and HubSpot CRM. It handles:

- **Contacts**: Name, email, phone, company
- **Companies**: Name, domain, industry
- **Conflict Detection**: When both local and HubSpot data are modified
- **Conflict Resolution**: User-friendly UI to choose which version to keep

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │◄───────►│  Express API    │◄───────►│    HubSpot      │
│  (Port 5173)    │         │  (Port 5005)    │         │    CRM API      │
│                 │         │                 │         │                 │
└─────────────────┘         └────────┬────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │                 │
                            │    MongoDB      │
                            │                 │
                            └─────────────────┘
```

### Sync Flow

1. **Local → HubSpot**: Records marked as "pending" are pushed to HubSpot
2. **HubSpot → Local**: Polling fetches recent HubSpot changes and updates local DB
3. **Conflict Detection**: If both sides changed since last sync, a conflict is created
4. **Conflict Resolution**: User manually chooses "Keep Local" or "Keep HubSpot"

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **MongoDB** + **Mongoose** - Database
- **Axios** - HTTP client for HubSpot API
- **Polling** (setInterval) - Periodic sync mechanism

### Frontend
- **React** (JavaScript) - UI framework
- **React Router** - Client-side routing
- **Axios** - API calls
- **Plain CSS** - Styling (no frameworks)

## 📁 Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Contact.js       # Contact schema
│   │   │   ├── Company.js       # Company schema
│   │   │   ├── Conflict.js      # Conflict schema
│   │   │   └── SyncLog.js       # Sync log schema
│   │   ├── controllers/
│   │   │   ├── contactsController.js
│   │   │   ├── companiesController.js
│   │   │   ├── conflictsController.js
│   │   │   └── syncController.js
│   │   ├── routes/
│   │   │   ├── contacts.js
│   │   │   ├── companies.js
│   │   │   ├── conflicts.js
│   │   │   └── sync.js
│   │   ├── services/
│   │   │   ├── hubspotService.js  # HubSpot API calls
│   │   │   └── syncService.js     # Sync logic
│   │   ├── utils/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── app.js                 # Express app setup
│   │   └── server.js              # Entry point
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ContactForm.jsx
│   │   │   ├── CompanyForm.jsx
│   │   │   ├── SyncStatusCard.jsx
│   │   │   └── ConflictResolver.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Contacts.jsx
│   │   │   ├── Companies.jsx
│   │   │   └── Conflicts.jsx
│   │   ├── services/
│   │   │   └── api.js             # API functions
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- HubSpot account with API access token (optional for testing)

### 1. Clone and Setup

```bash
# Navigate to project
cd IW
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
# Edit .env file with your settings:
# - PORT=5005
# - MONGODB_URI=mongodb://localhost:27017/hubspot-sync-tool
# - HUBSPOT_ACCESS_TOKEN=your_token_here

# Start the server
npm start
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5005

## 📚 API Documentation

### Contacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | Get all contacts |
| POST | `/api/contacts` | Create a contact |
| GET | `/api/contacts/:id` | Get a single contact |
| PUT | `/api/contacts/:id` | Update a contact |
| DELETE | `/api/contacts/:id` | Delete a contact |

**Request Body (POST/PUT):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "company": "Acme Inc"
}
```

### Companies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | Get all companies |
| POST | `/api/companies` | Create a company |
| GET | `/api/companies/:id` | Get a single company |
| PUT | `/api/companies/:id` | Update a company |

**Request Body (POST/PUT):**
```json
{
  "name": "Acme Inc",
  "domain": "acme.com",
  "industry": "Technology"
}
```

### Sync

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sync/run` | Trigger manual sync |
| GET | `/api/sync/status` | Get sync status |

**Status Response:**
```json
{
  "status": {
    "lastSyncTime": "2024-01-01T12:00:00Z",
    "pendingContacts": 2,
    "pendingCompanies": 0,
    "failedContacts": 0,
    "failedCompanies": 0,
    "unresolvedConflicts": 1,
    "isRunning": false
  }
}
```

### Conflicts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conflicts` | Get all conflicts |
| GET | `/api/conflicts?resolved=false` | Get unresolved only |
| POST | `/api/conflicts/resolve` | Resolve a conflict |

**Resolve Request:**
```json
{
  "conflictId": "conflict_id_here",
  "resolution": "local"  // or "remote"
}
```

## 🔄 Conflict Resolution

### How Conflicts Are Detected

1. When syncing, we compare `lastModified` timestamps
2. If local record was modified AND HubSpot record was modified since last sync → **CONFLICT**
3. Conflict is stored with both local and remote data snapshots

### Resolution Options

- **Keep Local**: Local data is kept, marked for push to HubSpot
- **Keep HubSpot**: HubSpot data overwrites local, marked as synced

## ⚠️ Error Handling

### Backend Error Handling

- All controllers use `try/catch` blocks
- Errors are logged to console
- HTTP 4xx/5xx responses with error messages
- Failed syncs increment `retryCount`
- After max retries (default: 3), status becomes "failed"

### Sync Errors

- Failed syncs are logged to `SyncLog` collection
- UI shows failed count on dashboard
- Records remain in "pending" or "failed" state

## 📊 Rate Limiting

The sync service uses a simple approach to avoid HubSpot rate limits:

1. **Polling Interval**: Default 5 minutes (configurable via `SYNC_INTERVAL` env var)
2. **Batch Processing**: Processes records one at a time
3. **Error Backoff**: Failed records get retry count incremented

**Note**: For production, consider implementing:
- Exponential backoff on failures
- Request queue with rate limiting
- Concurrent request limiting

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5005 | Backend server port |
| `MONGODB_URI` | mongodb://localhost:27017/hubspot-sync-tool | MongoDB connection |
| `HUBSPOT_ACCESS_TOKEN` | - | Your HubSpot API token |
| `SYNC_INTERVAL` | 300000 | Sync interval in ms (5 min) |
| `MAX_RETRY_COUNT` | 3 | Max retries before marking failed |

## 🧪 Testing the Application

### 1. Create a Contact

```bash
curl -X POST http://localhost:5005/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

### 2. Get All Contacts

```bash
curl http://localhost:5005/api/contacts
```

### 3. Trigger Sync

```bash
curl -X POST http://localhost:5005/api/sync/run
```

### 4. Check Sync Status

```bash
curl http://localhost:5005/api/sync/status
```

## 📝 Notes

- Without a valid HubSpot token, the app runs in "local-only mode"
- Dashboard auto-refreshes every 5 seconds
- Conflicts require manual resolution - no auto-overwrite
- All dates are stored in UTC

## 📄 License

ISC
