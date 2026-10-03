# Real-Time IPL Auction Room 🏏🏆

> An open-source, full-stack, real-time multiplayer IPL Auction web app built with Next.js 16 (App Router), Socket.IO, TypeScript, and MongoDB.

[![MIT License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![CI Build Status](https://img.shields.io/badge/CI-Passing-emerald.svg)](#github-actions-ci)
[![Node Version](https://img.shields.io/badge/Node.js-%3E%3D20.0-blue.svg)](https://nodejs.org)

---

## 🌟 Overview

**IPL Auction Room** allows cricket fans to host and participate in live multiplayer IPL auctions with up to 10 franchises, custom room codes, rule-based AI bots, authentic IPL bidding rules (Right To Match cards, retention slabs, overseas pay caps, anti-snipe countdown extensions), and dynamic post-auction squad analytics.

---

## ✨ Key Features

- **🎮 Real-Time Multiplayer Engine**: Server-authoritative state via Socket.IO with atomic bid processing, room code joining (`?room=CODE`), and session token seat recovery.
- **🏏 Authentic Auction Rules**:
  - **Mega Mode (IPL 2025)**: ₹120 Cr purse, 18–25 squad limits, max 8 overseas, up to 6 retentions & RTM cards with price-raise mechanics.
  - **Mini Mode (IPL 2026)**: ₹125 Cr purse, no RTM, ₹18 Cr Overseas Pay Cap with surplus allocated to the BCCI Welfare Fund.
- **🤖 Rule-Based AI Bots**: Auto-fill empty franchise slots with intelligent bots that bid based on base price, role needs, and purse reserves.
- **📊 Complete Player Dataset & Pipeline**: 190+ real IPL players built from Cricsheet ball-by-ball data with IPL statistics (Matches, Runs, Wickets, SR, Economy).
- **🎨 Rich Design & Audio UX**: Dark glassmorphic design system, avatar monograms (zero player photo uploads needed), full-screen SOLD/UNSOLD animations, Web Audio API sound effects, and floating emoji reactions.
- **🏆 Results & Exportable Squad Cards**: Role balance rating, value-for-money score, and one-click HTML5 Canvas image card export (`.png`).
- **🛡️ Battle-Tested & Resilient**: Anti-double-sale guarantees, rate limiting, MongoDB persistence for cold-start server rehydration, and React Error Boundaries.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend & Real-Time**: Node.js HTTP Server, Socket.IO 4.x, TypeScript
- **Database**: MongoDB Atlas (mongoose)
- **Data Source**: Cricsheet IPL ball-by-ball datasets (Open Attribution License)
- **Testing**: Vitest, TypeScript (`tsc --noEmit`)

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js >= 20.0
- npm >= 10.0
- MongoDB (local instance or free MongoDB Atlas cluster URI)

### 2. Clone & Install
```bash
git clone https://github.com/gautum/ipl_auction_game.git
cd ipl_auction_game
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `MONGODB_URI` points to your database:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ipl_auction
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Build & Seed Player Pool
```bash
# Validate data integrity & build dataset
npm run validate-players

# Seed database idempotently
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Assurance

```bash
# Run Vitest test suite (includes auction engine, rules, load tests & chaos tests)
npm run test

# Run TypeScript type-check
npm run type-check

# Run production build
npm run build
```

---

## 🌐 Free Persistent Deployment Guide

Because Socket.IO requires persistent WebSocket connections, deploy on a free hosting platform that supports persistent Node server processes (such as **Render**, **Railway**, or **Fly.io**).

### Deployment on Render (Free Tier)

1. **Create MongoDB Atlas Free Cluster**:
   - Create a free `M0` cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Obtain connection URI (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/ipl_auction`).

2. **Connect Repository to Render**:
   - Push your repo to GitHub and create a new **Web Service** on [Render](https://render.com).
   - Select **Docker** environment or use `render.yaml` Blueprint.

3. **Set Environment Variables**:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `<your_mongodb_atlas_uri>`
   - `NEXT_PUBLIC_APP_URL` = `https://your-app.onrender.com`

4. **Mitigating Cold Starts (Free Tier Sleep)**:
   - Render free web services sleep after 15 minutes of inactivity.
   - When woken up by a new request, **IPL Auction Room** automatically rehydrates all active room states and timer loops from MongoDB.
   - *Optional*: Set up a free pinger (e.g. [UptimeRobot](https://uptimerobot.com)) to send a GET request to `https://your-app.onrender.com/api/health` every 10 minutes to keep the server awake.

---

## 📜 Disclaimer & Attribution

- **Unofficial Fan Project**: This application is NOT affiliated with, authorized by, endorsed by, or associated with the Board of Control for Cricket in India (BCCI), the Indian Premier League (IPL), or any IPL franchises.
- **Data Attribution**: Match statistics and player registries are sourced from [Cricsheet](https://cricsheet.org), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

## 🤝 Contributing & License

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting pull requests.

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
