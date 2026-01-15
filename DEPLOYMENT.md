# Deployment Guide for HubSpot Data Sync Tool

This guide walks you through deploying your full-stack application to the web for free.

## Architecture

- **Database**: MongoDB Atlas (Free Tier)
- **Queue/Cache**: Upstash Redis (Free Tier)
- **Backend**: Render (Web Service - Free Tier)
- **Frontend**: Vercel (Static Site - Free Tier)

---

## Step 1: Push Code to GitHub

1. Initialize a git repository if you haven't already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Create a new repository on GitHub.
3. Push your code:
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

---

## Step 2: Set up Database (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up.
2. Create a free **M0 Cluster**.
3. Create a Database User (username/password) and whitelist IP `0.0.0.0/0` (Allow Access from Anywhere) in Network Access.
4. Get your connection string:
   - Click **Connect** > **Drivers**.
   - Copy the string. It looks like: `mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
   - **Save this for Step 4.**

---

## Step 3: Set up Redis (Upstash)

1. Go to [Upstash](https://upstash.com/) and console.
2. Create a new **Redis** database (Free).
3. Connect to it and copy the `endpoint` (Host) and `port`.
   - **Host**: `global-xxx.upstash.io`
   - **Port**: `6379`
   - **Password**: (You might need this if using a connection string, but our code uses Host/Port separately without auth in the current straightforward config. **Note**: If Upstash requires password (it does), we might need to update `backend/queues/syncQueue.js` to accept a password or use a `REDIS_URL` connection string.
   
   *Let's check your code:* Currently `syncQueue.js` uses `host` and `port` from `.env`.
   **Action Required**: Upstash requires a password. We should update the backend code to support a Redis Password or fully qualified URL. See "Code Update Required" below.

---

## Step 4: Deploy Backend (Render)

1. Go to [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. **Environment Variables**:
   Add the following specific keys:
   - `MONGODB_URI`: (From Step 2)
   - `HUBSPOT_ACCESS_TOKEN`: (Your HubSpot Token)
   - `REDIS_HOST`: (From Upstash)
   - `REDIS_PORT`: (From Upstash)
   - `REDIS_PASSWORD`: (From Upstash - *We will add support for this*)
   - `PORT`: `10000` (Render default)
6. Click **Create Web Service**.
7. Wait for it to deploy. Copy the **Service URL** (e.g., `https://my-app.onrender.com`).

---

## Step 5: Deploy Frontend (Vercel)

1. Go to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your Git repository.
4. Configure Project:
   - **Root Directory**: Click "Edit" and select `frontend`.
   - **Framework Preset**: Vite (should be auto-detected).
5. **Environment Variables**:
   - `VITE_API_URL`: Paste your Render Backend URL + `/api` (e.g., `https://my-app.onrender.com/api`).
   - *Important*: No trailing slash after `/api`.
6. Click **Deploy**.

---

## Code Update Required (Recommended)

To make Step 3 work seamlessly, update `backend/queues/syncQueue.js` to handle Redis password authentication, as secure cloud Redis requires it.

```javascript
const syncQueue = new Queue('sync-queue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD || undefined
    }
});
```
