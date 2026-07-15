# SaugaHomeEats

**A local home-food marketplace for Mississauga — connecting home-based cooks (tiffin services, home bakers, caterers) with neighbours who want authentic, affordable food.**

Group 1 · MGMT8155 Capstone (IT Project Management) · Conestoga College · Summer 2026

---

## What it is

Mississauga has hundreds of home-based food sellers — Punjabi tiffin kitchens, Filipino home cooks, Caribbean caterers, home bakers — but none of them appear in the City's official business directory, so buyers can't easily find them and sellers can't easily be discovered.

SaugaHomeEats is a lightweight web directory where:

- **Sellers** create a listing with their cuisine, neighbourhood, dietary tags (halal, vegetarian, vegan, gluten-free), photo, and menu items with prices.
- **Buyers** can browse the directory, search by name or cuisine, filter by neighbourhood or dietary tag, view a seller's full profile, and place an order.
- **Sellers** receive orders on their dashboard and can accept or decline them.

Real payment processing and live GPS delivery tracking are out of scope for the 3-sprint MVP — orders are recorded and status-tracked, but not paid in-app.

---

## Sprint Progress

| Sprint | Goal | Stories | Status |
|---|---|---|---|
| **Sprint 1** | Foundations — signup, profile, browse, view detail | US-01 to US-04 (21 pts) | ✅ Delivered |
| **Sprint 2** | Discovery + Ordering — search, filters, place order, seller dashboard | US-05 to US-10 (29 pts) | ✅ Delivered |
| **Sprint 3** | Tracking + Trust — order status, delivery map, reviews & ratings | US-11 to US-17 (37 pts) | 🚧 Planned |

**Cumulative:** 50 of 87 story points delivered.

---

## Tech Stack

Everything runs 100% locally. No cloud services, no external APIs, no internet required for the demo.

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind CSS + react-router-dom |
| Backend | Node.js + Express |
| Database | SQLite via `better-sqlite3` (single file, real SQL) |
| File uploads | `multer` |
| Auth | `bcrypt` password hashing + session tokens stored in a `sessions` table |
| Hosting | `localhost` (frontend on `:5173`, backend on `:3000`) |

**Node version:** 22 or 24 (pinned in `.nvmrc` and `engines`).

---

## Team

| Member | Role |
|---|---|
| **Mounika Sivagouni** | Product Owner + Developer |
| **Harshdeep Kaur** | Scrum Master + Frontend Developer (auth/session) |
| **Chandra Bhanu** | Frontend / Visual Design Developer |
| **Harmanjot Kaur** | Backend Developer |

---

## Getting Started

### Prerequisites

- Node.js 22 or 24 — [nodejs.org](https://nodejs.org)
- Git — [git-scm.com](https://git-scm.com)
- VS Code (recommended) — [code.visualstudio.com](https://code.visualstudio.com)

### Clone the repo

Keep the project **outside any cloud-sync folder** (OneDrive / iCloud / Dropbox). Syncing `node_modules` and the live SQLite database file will destabilize the dev server.

```bash
# Windows
cd C:\dev
git clone https://github.com/SivagouniMounika/SaugaHomeEats.git
cd SaugaHomeEats

# Mac / Linux
mkdir -p ~/dev && cd ~/dev
git clone https://github.com/SivagouniMounika/SaugaHomeEats.git
cd SaugaHomeEats
```

### Install and seed

```bash
# Backend
cd backend
npm install
npm run seed
```

### Run both servers

Open two terminals side by side.

**Terminal 1 — backend:**
```bash
cd backend
npm run dev
# → http://localhost:3000
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173). If you see 8 seller cards, you're up and running.

---

## Project Structure

```
SaugaHomeEats/
├── README.md
├── .gitignore
├── backend/
│   ├── server.js         # Express API + auth middleware + Multer + error handlers
│   ├── database.js       # SQLite connection + schema (6 tables)
│   ├── seed.js           # Sample sellers with photos
│   ├── uploads/          # Seller-uploaded photos (gitignored, seed images tracked)
│   ├── saugahome.db      # SQLite database (gitignored)
│   └── package.json
└── frontend/
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx           # Routes + layout
    │   ├── api.js            # Central fetch() wrappers
    │   ├── auth.js           # localStorage session helpers (seller + buyer)
    │   ├── index.css         # Tailwind + CSS variables
    │   ├── components/
    │   │   ├── Button.jsx        # Shared CTA with shine-sweep animation
    │   │   ├── Navbar.jsx        # Role-aware nav (seller / buyer / logged out)
    │   │   ├── Footer.jsx
    │   │   ├── SellerCard.jsx    # Card with menu-reveal hover effect
    │   │   └── DietaryPill.jsx
    │   └── pages/
    │       ├── HomePage.jsx
    │       ├── LoginPage.jsx / SignupPage.jsx           # Seller auth
    │       ├── BuyerLoginPage.jsx / BuyerSignupPage.jsx # Buyer auth
    │       ├── CreateListingPage.jsx
    │       └── SellerDetailPage.jsx
    └── package.json
```

---

## Database Schema

Six tables, all managed through `backend/database.js`:

- **`sellers`** — seller accounts, profile fields, photo URL
- **`buyers`** — buyer accounts (added in Sprint 2 to support ordering)
- **`sessions`** — auth tokens with a `user_type` column ('seller' or 'buyer')
- **`menu_items`** — dishes each seller offers with prices (Sprint 2)
- **`orders`** — buyer orders with status (Sprint 2)
- **`order_items`** — line items per order with server-resolved prices (Sprint 2)

---

## Sprint 2 Highlights

- Buyer accounts and dual-role authentication (one `sessions` table, `user_type` column)
- Menu items with per-seller ownership checks
- Order placement with **server-side price resolution** (buyers cannot tamper with prices)
- Dynamic search + filter on `GET /api/sellers` (name, cuisine, neighbourhood, dietary tag)
- Reusable `Button` component with shine-sweep animation
- `SellerCard` menu-reveal hover effect
- `Navbar` coral→gold gradient hairline, animated links, rotating hamburger

### Bugs squashed in Sprint 2

- Infinite re-render loop in `Navbar` (missing `useEffect` dependency array)
- Seller/buyer session contamination in `auth.js` (shared `TOKEN_KEY` cleared incorrectly)
- Multer oversized-upload error returned HTML instead of JSON (custom error handler added)
- `seed.js` used a separate SQLite driver from the app (rewritten to share `database.js`)
- Vite crash on install (pinned to `v5.4.11`)
- `DietaryPill` crash on null tags (added a render guard)

---

## Team Workflow

- **Version control:** GitHub (this repo), branch `master`, direct commits
- **Task tracking:** Jira
- **Documents:** OneDrive (backlog, sprint insights, standup log, review summary)
- **Communication:** MS Teams
- **Ceremonies:** Weekly stand-ups (in-class + on Teams), sprint planning at the start, sprint review + retrospective at the end

See [`docs/Sprint2_Sync_Push_Pull_Guide.docx`](.) for the per-developer git workflow.

---

## Out of Scope (Future Roadmap)

- Real credit card payment integration
- Live GPS driver tracking
- Native mobile apps
- Multi-city expansion

---

## License

Academic project — Conestoga College MGMT8155 Capstone. Not licensed for commercial use.
