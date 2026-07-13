# ⛽ Aplikasi Simulasi BBM — Pertamina

Aplikasi web untuk mensimulasikan pengisian BBM (bahan bakar minyak) pada kendaraan bermotor. Dilengkapi panel admin untuk mengelola data kendaraan, jenis BBM, dan harga. Bertema Pertamina dengan UI yang responsif.

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────┐
│                  Browser (Client)                │
│  frontend/index.html + script.js + Tailwind CDN  │
│         Vanilla JS SPA (no build step)           │
└─────────────────┬───────────────────────────────┘
                  │ HTTP (fetch + cookies)
                  │
┌─────────────────▼───────────────────────────────┐
│              Vercel / Express.js                  │
│                                                   │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Routes  │  │ Controllers  │  │ Middlewares │ │
│  │ api.js   │  │ auth.js      │  │ auth.js     │ │
│  │          │  │ bbm.js       │  │ validate.js │ │
│  └──────────┘  └──────────────┘  └────────────┘ │
│                                                   │
│  api/index.js (Vercel)  ←→  backend/index.js     │
└─────────────────┬───────────────────────────────┘
                  │ pg (node-postgres)
                  │
┌─────────────────▼───────────────────────────────┐
│          PostgreSQL (Neon / Railway / Lokal)      │
│  Tabel: bensin  |  motor  |  users               │
└─────────────────────────────────────────────────┘
```

### Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | Vanilla JS, HTML5, [TailwindCSS](https://tailwindcss.com) (CDN) |
| Backend | [Express.js 5](https://expressjs.com), ES Modules |
| Database | [PostgreSQL](https://www.postgresql.org) via [`pg`](https://node-postgres.com) |
| Auth | JWT (httpOnly cookie) + bcrypt |
| Testing | [Jest](https://jestjs.io) + [Supertest](https://github.com/ladjs/supertest) |
| Deployment | [Vercel](https://vercel.com) (serverless) |
| Hosting DB | [Neon](https://neon.tech) (gratis) |

---

## 📁 Struktur Proyek

```
simulasi_bbm/
├── api/
│   └── index.js                    # Entry point Vercel (thin wrapper → backend/)
├── backend/
│   ├── index.js                    # Express app utama, DB init, CORS, export
│   ├── .env                        # Environment variables lokal (tidak di-commit)
│   ├── package.json                # Dependencies backend + test scripts
│   ├── routes/
│   │   └── api.js                  # Definisi route + rate limiter
│   ├── controllers/
│   │   ├── authController.js       # Login / logout handler
│   │   └── bbmController.js        # CRUD BBM & motor + simulasi hitung
│   ├── middlewares/
│   │   ├── auth.js                 # JWT token verification middleware
│   │   └── validate.js             # Input validation middleware
│   ├── utils/
│   │   └── errors.js               # Safe error message helper
│   └── tests/
│       ├── authController.test.js  # Test auth endpoints
│       ├── bbmController.test.js   # Test BBM endpoints + validasi
│       └── protectedRoutes.test.js # Test protected route auth
├── frontend/
│   ├── index.html                  # SPA: tab Simulasi + tab Admin
│   ├── script.js                   # State management, API calls, render
│   └── style.css                   # Custom CSS (minimal, Tailwind handles most)
├── package.json                    # Root: dependencies + deploy scripts
├── vercel.json                     # Vercel build & routing config
├── .env.example                    # Template environment variables
└── README.md                       # Dokumentasi ini
```

---

## ✨ Fitur

### Tab Simulasi Pengisian
- Pilih merek motor dan kapasitas tangki (dari database)
- Pilih jenis BBM dan harga per liter (dari database)
- Metode nozzle: **Berdasarkan Rupiah** atau **Berdasarkan Liter**
- **Visual indikator tangki** — animasi pengisian dengan kode warna:
  - 🔴 Merah: ≤20% (bensin sekarat)
  - 🟡 Kuning: ≤50% (masih aman)
  - 🟢 Hijau: >50% (aman)
- Menampilkan volume (liter), total biaya (rupiah), persentase tangki, dan status
- Peringatan **"Meluber! Tangki tidak muat."** jika melebihi kapasitas

### Tab Panel Admin
- **Login** dengan username & password (JWT httpOnly cookie)
- **CRUD Kendaraan** — tambah & update merek motor + kapasitas tangki
- **CRUD BBM** — tambah & update nama BBM + harga per liter
- Auto-logout saat sesi berakhir

---

## 📋 Prasyarat

- **Node.js** versi 18+ (ES Modules support)
- **PostgreSQL** — bisa lokal, [Neon](https://neon.tech) (gratis), [Railway](https://railway.app), atau [Supabase](https://supabase.com)
- **npm** (bawaan Node.js)

---

## 🚀 Development Lokal

### 1. Clone & Install

```bash
git clone <repo-url>
cd simulasi_bbm
npm install
```

### 2. Setup Database & Environment

Salin `.env.example` ke `backend/.env`:

```bash
cp .env.example backend/.env
```

Isi `backend/.env` dengan kredensial database dan secret key:

```env
# Database PostgreSQL (wajib)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Secret Key JWT (wajib, minimal 16 karakter)
SECRET_KEY=buat_string_acak_panjang_minimal_16_karakter

# Admin default (opsional, akan dibuat otomatis saat pertama run)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=123456

# CORS origins (opsional, comma-separated untuk production)
ALLOWED_ORIGIN=https://domain-anda.vercel.app
```

### 3. Jalankan Backend

```bash
npm start
# → Server Backend berjalan di http://localhost:5000
```

Server akan otomatis:
- Membuat tabel `bensin`, `motor`, `users` jika belum ada
- Mengisi data awal (Pertamax, Pertalite, Honda Karisma, Honda Beat)
- Membuat user admin default dari environment variables

### 4. Buka Aplikasi

Server Express otomatis menyajikan frontend dan API dari origin yang sama:

```bash
npm start
# Buka browser → http://localhost:5000
```

---

## 🔒 Keamanan

Fitur keamanan yang sudah diimplementasikan:

| Fitur | Keterangan |
|-------|-----------|
| **JWT httpOnly cookie** | Token disimpan di cookie httpOnly, tidak bisa diakses JavaScript |
| **bcrypt hashing** | Password di-hash dengan salt rounds 10 |
| **Input validation** | Semua endpoint divalidasi (type, range, required fields) |
| **Rate limiting** | Login dibatasi 10 percobaan / 15 menit |
| **CORS whitelist** | Origin dibatasi ke `ALLOWED_ORIGIN` + localhost |
| **Error sanitization** | `err.message` tidak dikirim ke client di production |
| **SQL injection prevention** | Semua query pakai parameterized queries (`$1`, `$2`) |
| **XSS prevention** | Data dari DB tidak di-embed mentah ke HTML attribute |

---

