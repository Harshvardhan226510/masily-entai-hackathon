# MINT Ops - Enterprise AI Infrastructure Platform

## Problem Statement
Infrastructure project management across multiple sites relies on fragmented communication (WhatsApp, email), unstructured data (spreadsheets), and manual audits. This leads to budget leaks, inability to effectively compare vendor quotations, and zero reliable tracking of daily site progress, causing delays and financial losses.

## Solution Description
MINT Ops is an AI-Native Infrastructure Project Management Platform designed to enforce invariant budgets, automate vendor analysis, and perform multimodal verification of daily site progress. 

Key AI Integrations (Gemini 1.5 Flash):
1. **AI Vendor Decision Matrix**: Normalizes unstructured multi-vendor quotations, assigns a cost efficiency score, and flags contract risks automatically.
2. **Multimodal Site Auditor**: Audits site engineer's daily photo uploads against their claimed completion percentage, identifying discrepancies and detecting safety hazards.
3. **BOQ Budget Integrity Engine**: Hard-enforces budget freezes and prevents programmatic disbursements if they breach the approved capital envelope.

## Tech Stack
- Frontend: React.js (Vite), Tailwind CSS, Lucide React
- Backend: Node.js, Express.js, MongoDB (Mongoose), Zod, JWT
- AI: Google Gemini API (@google/generative-ai)

## Local Setup

### 1. Database
Make sure you have MongoDB running locally or a MongoDB Atlas URI.

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm run dev # or node index.js
```
Seed the database:
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
- PM (Project Manager): `pm@entai.com` / `password123`
- Site Engineer: `engineer@entai.com` / `password123`

## Deployment Instructions

### Backend (Render / Railway)
1. Push your repository to GitHub.
2. Connect your GitHub repository to Render/Railway.
3. Set the Environment Variables in the platform's dashboard:
   - `PORT`: 5000
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A strong secret key
   - `GEMINI_API_KEY`: Your Google Gemini API Key
4. Build Command: `npm install`
5. Start Command: `node index.js`

### Frontend (Vercel)
1. Import the repository into Vercel.
2. Set the Root Directory to `frontend`.
3. Framework Preset: Vite.
4. Add Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://mint-ops-backend.onrender.com/api`)
5. Click Deploy.
