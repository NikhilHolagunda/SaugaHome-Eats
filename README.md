# SaugaHomeEats 🍱

> Connecting Mississauga's home cooks with their neighbours.

**MGMT8155 Capstone Project — Sprint 1**

---

## Quick Start

### Prerequisites
- Node.js v22+ (required for built-in SQLite)
- Two terminal windows

### First-time setup
```bash
# Terminal 1 — Backend
cd backend
npm install
npm run seed        # Populate with 8 sample sellers

# Terminal 2 — Frontend
cd frontend
npm install
```

### Run during development
```bash
# Terminal 1 — Backend (http://localhost:3000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

Then open http://localhost:5173 in your browser.

---

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + react-router-dom
- **Backend:** Node.js + Express
- **Database:** SQLite via Node.js v22 built-in (`node:sqlite`)
- **Auth:** bcrypt + session tokens in localStorage
- **File uploads:** multer

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/signup | Register a new seller |
| POST | /api/login | Log in |
| POST | /api/logout | Log out |
| GET | /api/me | Get current seller |
| GET | /api/sellers | List all sellers (public) |
| GET | /api/sellers/:id | Get seller by ID |
| POST | /api/sellers | Create/update listing |

## Seed Accounts
All seed accounts use password: `password123`
- priya@saugahomeeats.test
- maria@saugahomeeats.test
- joy@saugahomeeats.test
- fatima@saugahomeeats.test
- latha@saugahomeeats.test
- nonna@saugahomeeats.test
- bintu@saugahomeeats.test
- meera@saugahomeeats.test

## Sprint 1 User Stories
- **US-01** Seller Registration & Login ✅
- **US-02** Seller Profile / Listing Creation ✅
- **US-03** Browse Listings (Home Page) ✅
- **US-04** View Listing Detail ✅
