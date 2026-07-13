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

### 4. Buka Frontend

Buka `frontend/index.html` langsung di browser, atau gunakan live server:

```bash
# Opsi 1: langsung buka
start frontend/index.html

# Opsi 2: dengan live server (jika punya Python)
cd frontend && python -m http.server 5500
# Buka http://localhost:5500
```

Frontend akan otomatis mendeteksi environment (localhost → port 5000, production → `/api`).

---

## 🧪 Testing

```bash
cd backend
npm test
```

**Cakupan test: 16 test, 3 suite**

| Suite | Cakupan |
|-------|---------|
| `authController.test.js` | Login sukses, username salah, password salah, logout |
| `bbmController.test.js` | GET data-awal, POST hitung (normal + overflow), validasi input (5 test) |
| `protectedRoutes.test.js` | Akses tanpa token, token invalid, token valid |

---

## 📡 API Reference

### Base URL
- **Production:** `https://<project>.vercel.app/api`
- **Development:** `http://localhost:5000/api`

### Authentication
Semua endpoint admin dilindungi JWT httpOnly cookie. Token didapat dari `POST /api/login` dan berlaku 1 jam.

---

### Endpoint Publik

#### `GET /api/health`
Cek status server.

**Response** `200`
```json
{ "status": "ok", "timestamp": "2026-07-13T12:00:00.000Z" }
```

---

#### `GET /api/data-awal`
Mendapatkan daftar motor dan BBM dari database.

**Response** `200`
```json
{
  "bensin": [
    { "id": 1, "nama_bbm": "Pertamax", "harga": 13200 },
    { "id": 2, "nama_bbm": "Pertalite", "harga": 10000 }
  ],
  "motor": [
    { "id": 1, "merek": "Honda Karisma 125", "kapasitas": 3.7 },
    { "id": 2, "merek": "Honda Beat", "kapasitas": 4.2 }
  ]
}
```

---

#### `POST /api/hitung`
Menghitung simulasi pengisian BBM. **Divalidasi** — semua field harus angka positif.

**Body:**
```json
{
  "inputUser": 30000,
  "tipeInput": "uang",
  "kapasitasTangki": 4.2,
  "hargaBbm": 10000
}
```

| Field | Tipe | Keterangan |
|-------|------|------------|
| `inputUser` | number | Jumlah uang atau liter (> 0) |
| `tipeInput` | string | `"uang"` atau `"liter"` |
| `kapasitasTangki` | number | Kapasitas tangki dalam liter (> 0) |
| `hargaBbm` | number | Harga BBM per liter (> 0) |

**Response** `200`
```json
{
  "literDidapat": 3,
  "totalBiaya": 30000,
  "persentaseTangki": 71.4,
  "status": "Aman"
}
```

**Response** `400` (validasi gagal)
```json
{ "error": "Jumlah pengisian harus berupa angka positif." }
```

---

### Endpoint Auth

#### `POST /api/login`
Login admin. **Rate limited:** maks 10 percobaan per 15 menit. **Divalidasi.**

**Body:**
```json
{ "username": "admin", "password": "123456" }
```

**Response** `200`
```json
{ "message": "Login Berhasil!" }
```
→ Set httpOnly cookie `token` (JWT, 1 jam)

**Response** `400`
```json
{ "error": "Username atau Password salah!" }
```

**Response** `429` (rate limit)
```json
{ "error": "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." }
```

---

#### `POST /api/logout`
Logout & hapus cookie.

**Response** `200`
```json
{ "message": "Logout Berhasil!" }
```

---

### Endpoint Admin (Protected)

Semua endpoint berikut memerlukan cookie `token` yang valid.

#### `POST /api/motor` 🔒
Tambah kendaraan baru. **Divalidasi.**

**Body:**
```json
{ "merek": "Yamaha NMAX", "kapasitas": 7.1 }
```

**Response** `200`
```json
{ "message": "Motor baru berhasil disimpan di PostgreSQL!" }
```

---

#### `PUT /api/motor/:id` 🔒
Update data kendaraan. **Divalidasi.**

**Body:** sama dengan POST

**Response** `200`
```json
{ "message": "Data motor berhasil diperbarui di PostgreSQL!" }
```

---

#### `POST /api/bensin` 🔒
Tambah jenis BBM baru. **Divalidasi.**

**Body:**
```json
{ "nama_bbm": "Pertamax Turbo", "harga": 15500 }
```

**Response** `200`
```json
{ "message": "BBM baru berhasil disimpan di PostgreSQL!" }
```

---

#### `PUT /api/bensin/:id` 🔒
Update data BBM. **Divalidasi.**

**Body:** sama dengan POST

**Response** `200`
```json
{ "message": "Data bensin berhasil diperbarui di PostgreSQL!" }
```

---

## 🚢 Deployment (Vercel)

### 1. Setup Database

Buat database PostgreSQL gratis di [Neon](https://neon.tech):
1. Sign up → buat project → pilih region terdekat (Singapore)
2. Copy **Connection String** (`postgresql://...`)

### 2. Deploy ke Vercel

1. Push repository ke GitHub
2. Buka [Vercel](https://vercel.com) → **Add New Project** → import repo
3. **Settings:**
   - Framework Preset: `Other`
   - Root Directory: `./`
4. Tambahkan **Environment Variables:**

| Variable | Nilai |
|----------|-------|
| `DATABASE_URL` | Connection string dari Neon |
| `SECRET_KEY` | String acak panjang (min. 16 karakter) |
| `ADMIN_USERNAME` | admin (atau custom) |
| `ADMIN_PASSWORD` | Password admin |
| `ALLOWED_ORIGIN` | `https://nama-project.vercel.app` |

5. Klik **Deploy**

### 3. Verifikasi

Buka `https://nama-project.vercel.app` — frontend akan termuat, dan API akan berfungsi karena frontend & backend berbagi domain yang sama (no CORS issues).

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

