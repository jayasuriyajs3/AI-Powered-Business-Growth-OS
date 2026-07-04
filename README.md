# GrowthOS AI 🚀
### "Your AI Executive Team that Thinks, Plans, Executes, and Grows Your Business"

GrowthOS AI is an autonomous, multi-agent business growth operating system that transforms raw company parameters into strategic diagnostic audits, live department debates, and actionable strategic roadmaps.

---

## 🏛️ Project Identity

| Field | Detail |
|---|---|
| **Problem** | Businesses have data but no executive intelligence. CRMs store data; chatbots answer simple prompts. GrowthOS AI debates and acts. |
| **Solution** | 9 specialized AI agents representing a full corporate suite that debate, vote, and generate strategies live. |
| **Stack** | Next.js (React) + Node.js (Express) + Groq SDK (Llama 3.3 70B) + MongoDB Atlas + Recharts |
| **Theme** | Custom Obsidian Dark Glassmorphism (pure Vanilla CSS) |

---

## 🧬 Core Features (Phase 1 Complete)

1. **Interactive Onboarding Wizard:** A 5-step checklist capturing basics, financial health, customer sales pipelines, marketing budgets, and competitors.
2. **Load Profile Selector:** Easily load previously onboarded company profiles directly from MongoDB Atlas.
3. **Growth DNA spider chart:** Renders an interactive 5-axis Recharts radar chart mapping Innovation, Marketing, Sales, Finance, and Operations capabilities.
4. **AI SWOT Health Report:** Performs diagnostic telemetry to output key Strengths, Weaknesses, Opportunities, Threats, strategic insights, and immediate priorities.
5. **Live Executive Boardroom Debate:** Watch 9 specialized department agents sequentially debate company challenges in real time, with subsequent agents reviewing earlier conversation history.
6. **Multi-Agent Voting Deck:** Department agents cast YES/NO votes + confidence ratings on the final CEO proposal before a veto synthesis.
7. **Actionable Strategy Generator:** Generates structured 30/90/180-day growth plans complete with owner roles, difficulty tags, and strategy scores.
8. **Explainable AI:** Prompts lay out concrete evidence and confidence ratings rather than opaque black-box recommendations.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js (App Router), React, Zustand (Persistent storage state), Lucide React (Icons), Recharts (SVG Charts), Framer Motion (Animations).
* **Backend:** Node.js, Express, Mongoose (MongoDB Atlas), Groq API SDK (Llama 3.3 70B Versatile), Server-Sent Events (SSE) for text streaming.
* **Design:** Custom Obsidian glassmorphism using raw Vanilla CSS (zero Tailwind dependencies) to provide a premium, cohesive UI.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* [Node.js](https://nodejs.org/) installed (v18+ recommended)
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster set up
* [Groq API Key](https://console.groq.com/) for Llama inference

### 2. Backend Installation & Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `backend/` and configure the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/growthos
   GROQ_API_KEY=gsk_...your_groq_key_here...
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```
4. Start the development backend:
   ```bash
   npm run dev
   ```

### 3. Frontend Installation & Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🤖 The Boardroom Speak Sequence
The executive debate cycles sequentially on the backend to allow contextual reasoning:
$$\text{Data Analyst 📊} \rightarrow \text{Marketing 🎯} \rightarrow \text{Sales 📈} \rightarrow \text{Finance 💰} \rightarrow \text{Operations ⚙️} \rightarrow \text{Customer Success 🤝} \rightarrow \text{Innovation 💡} \rightarrow \text{Strategy 🗺️} \rightarrow \text{CEO 👔}$$
All department messages and voting tallies are streamed live to the UI using Server-Sent Events (SSE).
