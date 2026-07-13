# ⛽ Simulasi BBM

Aplikasi web untuk mensimulasikan pengisian BBM pada kendaraan bermotor + panel admin untuk mengelola data kendaraan dan jenis BBM.

---

## 🏗️ Arsitektur

```
┌──────────────────────────────────────────┐
│            Browser (Client)               │
│   React + Vite SPA + Tailwind CSS v4      │
└──────────────┬───────────────────────────┘
               │ HTTP (fetch + cookies)
┌──────────────▼───────────────────────────┐
│           Express.js + SQLite              │
│                                            │
│  ┌──────────┐  ┌──────────────┐           │
│  │  Routes  │  │ Controllers  │           │
│  │ api.js   │  │ auth.js      │           │
│  │          │  │ simulasi.js  │           │
│  └──────────┘  └──────────────┘           │
│                                            │
│  Frontend static ← Vite build (dist/)      │
│  SQLite ← sql.js (WASM, no native deps)    │
└──────────────────────────────────────────┘
```

| Layer | Teknologi |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | Express.js 5 (ESM) |
| Database | SQLite via `sql.js` (zero native deps) |
| Auth | JWT httpOnly cookie + bcrypt |
| Testing | Jest + Supertest |
| Deploy | Railway / Render / VPS |

---

## ✨ Fitur

### Tab Simulasi Pengisian
- Pilih kendaraan + jenis BBM
- Metode: **Rupiah** atau **Liter**
- Kalkulasi real-time
- Visual tangki dengan warna: 🔴 ≤20%, 🟡 ≤50%, 🟢 >50%
- Peringatan overflow: "Meluber! Tangki tidak muat."

### Tab Panel Admin
- Login JWT httpOnly cookie
- CRUD kendaraan (tambah, edit, hapus)
- CRUD BBM (tambah, edit, hapus)
- Rate limiting login: 10/15 menit

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Development (Vite HMR + Express API)
npm run dev
# → Frontend: http://localhost:5173
# → API:      http://localhost:5000

# Production
npm start
# → Build frontend + start server di http://localhost:5000

# Test
npm test
```

---

## 📁 Struktur Proyek

```
simulasi_bbm/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Navbar
│   │   │   ├── simulasi/      # TankVisual, FuelForm, ResultDisplay
│   │   │   └── admin/         # Login, Dashboard
│   │   ├── context/           # AppContext (global state)
│   │   └── styles/            # Tailwind directives
│   └── vite.config.js
├── server/                    # Express + SQLite backend
│   ├── db/                    # connection.js, init.js
│   ├── routes/                # api.js
│   ├── controllers/           # authController, simulasiController
│   ├── middlewares/           # auth.js (JWT), validate.js
│   ├── utils/                 # errors.js
│   └── tests/                 # api.test.js
├── package.json               # Root: dev/start/test scripts
├── .env.example               # SECRET_KEY
├── PRD.md
└── README.md
```

---

## 🔧 Environment Variables

Salin `.env.example` ke `.env`:

```env
# Wajib di production
SECRET_KEY=buat_string_acak_minimal_16_karakter

# Opsional (default: admin/admin123)
# ADMIN_USERNAME=admin
# ADMIN_PASSWORD=admin123
```

---

## 🔒 Keamanan

| Fitur | Implementasi |
|---|---|
| JWT | httpOnly cookie, secure, sameSite lax, 24 jam |
| Password | bcrypt, salt rounds 10 |
| Input validation | Required, type, range, string length |
| Rate limiting | Login: 10 request / 15 menit |
| SQL injection | Parameterized queries |
| XSS | React auto-escape |

---

## 📦 Deployment

### Railway (rekomendasi)

1. Push ke GitHub
2. Connect repo di Railway
3. Set env var `SECRET_KEY`
4. Railway auto-deploy dari `main`

### VPS / Lokal

```bash
npm start
# Server berjalan di port 5000
```

---

## 🧪 Testing

```bash
npm test
# 11 test: API endpoints, auth, validation, protected routes
```
