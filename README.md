# Finance Dashboard API – README

## 🔧 Overview
This project is a Node.js + Express backend powering a personal finance dashboard. It uses PostgreSQL (hosted on Render) and follows a modular route structure.

## 🚀 Features
- **Bank Balance API** (`/api/balance`)
- **Recurring Bills System** using a master-detail schema:
  - `bill_master` holds static metadata (name, category, recurrence pattern)
  - `bills` holds monthly occurrences (amount, due date, paid status)
- **Automatic Future Bill Generation**
- **Credit Card API** with sorting and inclusion in due balance

---

## 📦 Project Structure
```
server/
├── db.js                 # PostgreSQL connection pool
├── server.js             # Express entrypoint
├── routes/
│   ├── balance.js        # /api/balance
│   ├── bills.js          # /api/bills
│   └── credit_cards.js   # /api/credit_cards
├── migrations/
│   └── 001_add_bill_master.sql  # Migration script (master-detail)
└── .env                  # Connection secrets (local only)
```

---

## 🧪 Getting Started (Local Dev)

1. **Clone the repo**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure `.env`** (example provided below)
4. **Run the server**
   ```bash
   npm run dev  # For hot reload (nodemon)
   ```

---

## 🛠️ Database Setup

### 🔁 Migrations (Manual via pgAdmin or psql)
Run this manually before first use:
```sql
-- ./server/migrations/001_add_bill_master.sql
```
This will:
- Create `bill_master`
- Link it to `bills`
- Drop legacy columns from `bills`

### ❌ Legacy Setup Script
`init-db.js` is now deprecated. All schema changes are managed with `.sql` files.

---

## 🌐 Environment Variables
```
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=your_host
DB_PORT=5432
DB_DATABASE=your_db_name
DATABASE_URL=postgresql://your_user:your_password@your_host:5432/your_db_name
```

---

## 🔌 API Endpoints

### Balance
- `GET /api/balance`
- `PUT /api/balance` – `{ balance: number }`

### Bills
- `GET /api/bills?month=YYYY-MM&view=current_and_overdue`
- `POST /api/bills` – `{ name, amount, dueDate, isPaid, isRecurring, category }`
- `PATCH /api/bills/:id`
- `DELETE /api/bills/:id`

### Credit Cards
- `GET /api/credit_cards`
- `POST /api/credit_cards`
- `PATCH /api/credit_cards/:id`
- `PATCH /api/credit_cards/reorder`
- `DELETE /api/credit_cards/:id`

---

## 🧼 Housekeeping
- Ensure `.env` is excluded from version control.
- Always run new `.sql` files before deploying updated routes.

---

## 🧱 Coming Soon
- `002_add_tags.sql` for tagging bills
- User accounts & multi-tenancy support
- Auth layer (JWT / session)

---

## 🧠 Tip
Use tools like [Postman](https://postman.com) to test endpoints, or hit `/api/ping` to confirm the server is up.

---

## 🐛 Contact
For bugs or feature requests, reach out in your team workspace or issue tracker.
