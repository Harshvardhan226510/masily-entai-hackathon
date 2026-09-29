# Masily (Manage Easily) - Enterprise AI Infrastructure Platform

## Problem Statement
Large-scale infrastructure and construction projects suffer from fragmented communication, unstructured data, and manual site audits. This disconnect between field operations and the project management office leads to severe budget leaks, inability to effectively normalize and compare vendor quotations, and zero reliable tracking of daily site progress, resulting in costly delays.

## Solution Description
**Masily (Manage Easily)** is an AI-Native Enterprise Project Management Platform built to enforce invariant budgets, automate vendor analysis, and perform multimodal AI verification of daily site progress. 

Key AI Integrations (Powered by Google Gemini 2.5 Flash):
1. **AI Vendor Decision Matrix**: Automatically normalizes unstructured, multi-vendor quotations, assigns a commercial value score, and flags contract risks through multi-dimensional vector analysis.
2. **Multimodal Site Auditor**: Audits site engineers' daily visual evidence uploads against their claimed completion percentages, identifying visual discrepancies and automatically detecting critical safety hazards (e.g., exposed wiring).
3. **BOQ Budget Integrity Engine**: Hard-enforces budget freezes and prevents programmatic disbursements if they breach the approved capital envelope.

## Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Recharts, Lucide React
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Zod, JWT
- **AI Integration**: Google Gemini API (`@google/generative-ai`)

## Local Setup

### 1. Database
Ensure you have a MongoDB cluster running or use a MongoDB Atlas URI.

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY and MONGODB_URI
npm run dev
```
To seed the initial data:
```bash
node seed.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Demo Accounts
- **Project Manager**: `pm@entai.com` | Pass: `password123`
- **Site Engineer**: `engineer@entai.com` | Pass: `password123`

## Vercel Deployment Guide

To deploy this application to the web:

### 1. Deploy the Backend (Render / Railway)
Since Vercel is optimized for frontends, deploy your Node.js backend to a service like Render:
1. Create a New Web Service on Render and connect your GitHub repo.
2. Set the Root Directory to `backend`.
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. Add Environment Variables: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`.
6. Deploy and copy your backend URL (e.g., `https://masily-backend.onrender.com`).

### 2. Deploy the Frontend (Vercel)
1. Go to Vercel and import your GitHub repository.
2. Set the **Framework Preset** to `Vite`.
3. Set the **Root Directory** to `frontend`.
4. In Environment Variables, add:
   - Name: `VITE_API_URL`
   - Value: `https://masily-backend.onrender.com/api` *(replace with your actual Render URL + /api)*
5. Click **Deploy**.
