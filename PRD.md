# Product Requirements Document — Simulasi BBM v2

## 1. Product Overview

| Item | Detail |
|---|---|
| **Nama** | Simulasi BBM |
| **Deskripsi** | Aplikasi web interaktif untuk mensimulasikan pengisian BBM pada kendaraan bermotor + panel admin untuk mengelola data |
| **Target** | Masyarakat umum (simulasi) & admin/petugas (kelola data) |
| **Bahasa** | Indonesia (UI + error messages + validasi) |

## 2. Tujuan Rebuild

1. **Self-contained** — `npm install && npm start` langsung jalan tanpa setup database eksternal
2. **Modern frontend** — Vanilla JS (~600 lines, manual DOM) → React + Vite (komponen reusable)
3. **Single origin** — backend menyajikan frontend, tidak perlu CORS di dev/prod
4. **Minimal env vars** — hanya `SECRET_KEY`, sisanya hardcoded dengan default yang masuk akal

## 3. Arsitektur

| Layer | Teknologi |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS v4 |
| Backend | Express.js + SQLite (`better-sqlite3`) |
| Auth | JWT httpOnly cookie + bcrypt |
| Deploy | Railway.app (persistent disk) |

## 4. Fitur

### 4.1 Tab Simulasi Pengisian (Publik)

| Fitur | Detail |
|---|---|
| Pilih kendaraan | Dropdown dari tabel `motor` (merek + kapasitas) |
| Pilih BBM | Dropdown dari tabel `bensin` (nama + harga/L) |
| Metode input | Radio: **Rupiah** (input uang → output liter) atau **Liter** (input volume → output biaya) |
| Kalkulasi real-time | Setiap perubahan input langsung hitung ulang |
| Visual tangki | Bar vertikal mengisi dari bawah dengan transisi 500ms ease-out |
| Warna indikator | 🔴 Merah ≤20%, 🟡 Kuning ≤50%, 🟢 Hijau >50% |
| Hasil | Volume (L), Biaya (Rp), Persentase (%), Status |
| Overflow warning | "Meluber! Tangki tidak muat." jika liter > kapasitas |
| Format rupiah | `Intl.NumberFormat("id-ID")` — Rp 10.000 |

### 4.2 Tab Panel Admin (Protected)

| Fitur | Detail |
|---|---|
| Login | Username + password → JWT httpOnly cookie |
| Session | localStorage flag untuk UI hint; validasi real via cookie JWT |
| CRUD Kendaraan | Tambah, edit, hapus |
| CRUD BBM | Tambah, edit, hapus |
| Auto-logout | 401/403 handler → clear state + redirect ke login |
| Rate limiting | Login: 10 attempt / 15 menit per IP |

## 5. Spesifikasi Teknis

### 5.1 Database — SQLite (`data.db`)

```sql
CREATE TABLE motor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merek TEXT NOT NULL,
  kapasitas REAL NOT NULL
);

CREATE TABLE bensin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_bbm TEXT NOT NULL UNIQUE,
  harga INTEGER NOT NULL
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);
```

**Seed data:**

| Tabel | Data |
|---|---|
| `motor` | Honda Beat (4.2L), Honda Vario (5.0L), Yamaha NMAX (6.6L) |
| `bensin` | Pertalite (Rp 10.000), Pertamax (Rp 12.950), Pertamax Turbo (Rp 14.400) |
| `users` | admin / admin123 (bcrypt hash) |

### 5.2 API Endpoints

**Public:**

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/motor` | — | `[{ id, merek, kapasitas }]` |
| `GET` | `/api/bbm` | — | `[{ id, nama_bbm, harga }]` |
| `POST` | `/api/simulasi` | `{ inputUser, tipeInput, kapasitasTangki, hargaBbm }` | `{ literDidapat, totalBiaya, persentaseTangki, status }` |
| `POST` | `/api/auth/login` | `{ username, password }` | `{ message }` + set httpOnly cookie |
| `POST` | `/api/auth/logout` | — | `{ message }` + clear cookie |
| `GET` | `/api/auth/me` | — | `{ loggedIn, username }` atau 401 |
| `GET` | `/api/health` | — | `{ status: "ok" }` |

**Protected** (JWT cookie required):

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/api/motor` | `{ merek, kapasitas }` | `{ message, id }` |
| `PUT` | `/api/motor/:id` | `{ merek, kapasitas }` | `{ message }` |
| `DELETE` | `/api/motor/:id` | — | `{ message }` |
| `POST` | `/api/bbm` | `{ nama_bbm, harga }` | `{ message, id }` |
| `PUT` | `/api/bbm/:id` | `{ nama_bbm, harga }` | `{ message }` |
| `DELETE` | `/api/bbm/:id` | — | `{ message }` |

### 5.3 Logika Simulasi

```js
if (tipeInput === "uang") {
  literDidapat = inputUser / hargaBbm;
  totalBiaya = inputUser;
} else {
  literDidapat = inputUser;
  totalBiaya = inputUser * hargaBbm;
}
persentaseTangki = (literDidapat / kapasitasTangki) * 100;
status = literDidapat > kapasitasTangki
  ? "Meluber! Tangki tidak muat."
  : "Aman";
```

### 5.4 Komponen React

```
App
├── Navbar (tab switcher)
├── SimulasiPage
│   ├── TankVisual (animasi tangki)
│   ├── FuelForm (input form)
│   └── ResultDisplay (hasil perhitungan)
└── AdminPage
    ├── AdminLogin
    └── AdminDashboard
        ├── KendaraanForm (CRUD)
        └── BbmForm (CRUD)
```

### 5.5 Keamanan

| Fitur | Implementasi |
|---|---|
| JWT | httpOnly cookie, secure di production, sameSite lax, expire 24 jam |
| Password | bcrypt, salt rounds 10 |
| Input validation | Middleware: required, type, range, string length |
| Rate limiting | 10 request / 15 menit untuk login |
| SQL injection | Parameterized queries (`better-sqlite3`) |
| XSS | React auto-escape |

## 6. Development Workflow

```bash
npm run dev    # Development (Vite HMR + Express)
npm start      # Production (Vite build + Express serve)
npm test       # Jest tests
```

## 7. Deployment

| Target | Railway.app |
|---|---|
| Runtime | Node.js 20+ |
| Disk | Persistent (SQLite aman) |
| Env var | `SECRET_KEY` + `NODE_ENV=production` |

## 8. Acceptance Criteria

- [ ] `npm install && npm start` → aplikasi berjalan tanpa error
- [ ] Database SQLite auto-create + seed data terisi
- [ ] Simulasi: animasi tangki berubah real-time, overflow warning berfungsi
- [ ] Admin: login, CRUD kendaraan, CRUD BBM berfungsi
- [ ] Admin: endpoint protected tanpa cookie → 401
- [ ] `npm test` → semua passing
- [ ] Responsive: mobile (375px) dan desktop (1280px+)

## 9. Perbandingan v1 vs v2

| Aspek | v1 | v2 |
|---|---|---|
| Database | PostgreSQL eksternal | SQLite file lokal |
| Env vars | 5 (DATABASE_URL, SECRET_KEY, ...) | 1 (SECRET_KEY) |
| Frontend | Vanilla JS | React + Vite |
| State | Manual DOM | React Context |
| DELETE endpoints | Tidak ada | Ada |
| JWT expiry | 1 jam | 24 jam |
| CORS | Perlu config | Tidak perlu |
