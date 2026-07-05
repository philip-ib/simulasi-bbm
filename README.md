# Aplikasi Simulasi BBM (Tema Pertamina)

Aplikasi Simulasi BBM adalah sebuah aplikasi berbasis web yang berfungsi sebagai kalkulator pengisian bahan bakar minyak (BBM) bergaya dispenser Pertamina. Aplikasi ini memungkinkan pengguna untuk mensimulasikan pengisian BBM berdasarkan jumlah uang (Rupiah) atau volume (Liter) dengan mempertimbangkan kapasitas maksimal tangki dari berbagai jenis motor. Selain itu, aplikasi ini dilengkapi dengan Panel Admin terproteksi untuk mengelola jenis bahan bakar dan tipe kendaraan.

---

## 🛠 Teknologi Stack

- **Frontend:**
  - HTML5, CSS3, Vanilla JavaScript
  - **Vue.js 3** (melalui CDN, menggunakan Options API)
  - **TailwindCSS** (melalui CDN untuk styling cepat dan responsif)
- **Backend:**
  - **Node.js** & **Express.js** (Server-side API)
- **Database:**
  - **PostgreSQL**
- **Testing:**
  - **Jest** & **Supertest**

### Library / Package yang Digunakan (Backend)
- `express`: Framework web server.
- `pg`: Client PostgreSQL untuk Node.js.
- `cors`: Middleware untuk menangani Cross-Origin Resource Sharing.
- `jsonwebtoken`: Untuk membuat dan memvalidasi JSON Web Tokens (JWT).
- `bcrypt`: Untuk melakukan *hashing* password admin.
- `cookie-parser`: Membaca token otentikasi dari *HttpOnly Cookies*.
- `dotenv`: Memuat *environment variables* dari file `.env`.
- `serverless-http`: Wrapper agar aplikasi Express siap di-deploy ke *serverless functions* (seperti Vercel).

---

## 📂 Arsitektur & Struktur Direktori

Aplikasi ini mengadopsi arsitektur pemisahan antara sisi Klien (Frontend) dan sisi Server (Backend). Backend dibangun menggunakan pola **MVC (Model-View-Controller)** yang dimodifikasi, di mana antarmuka (View) dipisah sepenuhnya di folder `frontend`.

```text
simulasi_bbm/
├── frontend/                 # Sisi Klien (Antarmuka Pengguna)
│   ├── index.html            # Struktur kerangka antarmuka (UI)
│   ├── script.js             # Logika Vue.js, state management, & API call
│   └── style.css             # Styling kustom tambahan
│
├── backend/                  # Sisi Server (API)
│   ├── index.js              # Entry point, setup Express, CORS, Cookie, & koneksi DB
│   ├── package.json          # Daftar dependensi & script Node.js
│   ├── controllers/          # Logika pemrosesan request & interaksi database
│   │   ├── authController.js # Menangani proses Login & Logout admin
│   │   └── bbmController.js  # Menangani kalkulasi, serta CRUD bensin & motor
│   ├── middlewares/          # Fungsi penengah sebelum mencapai controller
│   │   └── auth.js           # Memverifikasi keabsahan JWT dari HttpOnly Cookie
│   ├── routes/               # Peta jalan/jalur endpoint API
│   │   └── api.js            # Mendaftarkan semua endpoint & menghubungkan ke controller
│   └── tests/                # Kumpulan file pengujian (Unit Tests)
│       ├── authController.test.js
│       ├── bbmController.test.js
│       └── protectedRoutes.test.js
```

---

## 🗄 Skema Database (PostgreSQL)

Terdapat tiga tabel utama yang diinisialisasi secara otomatis saat server dijalankan pertama kali:

1. **Tabel `users`** (Untuk otentikasi admin)
   - `id` (SERIAL PRIMARY KEY)
   - `username` (TEXT UNIQUE NOT NULL)
   - `password` (TEXT NOT NULL) - *Disimpan dalam format hash bcrypt*

2. **Tabel `bensin`**
   - `id` (SERIAL PRIMARY KEY)
   - `nama_bbm` (TEXT)
   - `harga` (INTEGER)

3. **Tabel `motor`**
   - `id` (SERIAL PRIMARY KEY)
   - `merek` (TEXT)
   - `kapasitas` (REAL)

---

## 📡 Dokumentasi API

Seluruh rute (*endpoint*) API diawali dengan `/api`.

### API Publik (Tanpa Otentikasi)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/data-awal` | Mengambil seluruh daftar bensin dan motor. |
| `POST` | `/api/hitung` | Mengirim data input (*uang/liter*, kapasitas tangki, harga BBM) dan menerima hasil kalkulasi simulasi. |
| `POST` | `/api/login` | Menerima `username` dan `password`. Jika sukses, mengembalikan `HttpOnly Cookie` berisi token JWT. |
| `POST` | `/api/logout` | Membersihkan *cookie* token otentikasi pengguna. |

### API Terproteksi Admin (Membutuhkan HttpOnly Cookie)
*Semua request di bawah ini wajib menyertakan cookie otentikasi (credentials: "include").*

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/motor` | Menambahkan jenis motor baru (Merek & Kapasitas). |
| `PUT`  | `/api/motor/:id` | Mengubah data motor berdasarkan ID. |
| `POST` | `/api/bensin` | Menambahkan jenis bensin baru (Nama BBM & Harga). |
| `PUT`  | `/api/bensin/:id`| Mengubah data bensin berdasarkan ID. |

---

## 🚀 Cara Setup & Menjalankan Proyek

### 1. Setup Backend
1. Buka terminal dan masuk ke folder `backend`:
   ```bash
   cd backend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env` di dalam folder `backend` dan isi dengan konfigurasi berikut:
   ```env
   PORT=5000
   DATABASE_URL=postgres://user:password@localhost:5432/namadatabase
   SECRET_KEY=rahasia_jwt_anda_yang_sangat_panjang_dan_aman
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=123456
   ```
   *(Catatan: Ganti nilai `DATABASE_URL` dengan kredensial PostgreSQL Anda. `ADMIN_USERNAME` dan `ADMIN_PASSWORD` akan digunakan sebagai data awal pembuatan akun admin jika tabel `users` masih kosong).*
4. Jalankan server backend:
   ```bash
   npm start
   ```
   Server akan berjalan di `http://localhost:5000` dan otomatis melakukan inisialisasi tabel database jika belum ada.

### 2. Setup Frontend
Aplikasi frontend berupa file statis murni sehingga tidak perlu instalasi `npm`. Anda bisa menjalankannya dengan dua cara:
- **Cara Mudah:** Klik kanan pada file `frontend/index.html` dan pilih **Open with Live Server** (jika menggunakan VSCode).
- **Cara Terminal:** Atau, Anda bisa menjalankan *static server*:
  ```bash
  cd frontend
  npx serve -l 8000
  ```
Buka browser Anda ke `http://localhost:8000`.

---

## 🧪 Cara Melakukan Testing (Unit Test)

Aplikasi ini menggunakan Jest dan Supertest untuk menguji API backend. Skrip pengujian otomatis berjalan di lingkungan ES Modules (`--experimental-vm-modules`).

1. Pastikan Anda berada di direktori `backend`:
   ```bash
   cd backend
   ```
2. Jalankan perintah *test*:
   ```bash
   npm test
   ```
3. Anda akan melihat log rincian dari 11 *test cases* yang menguji Controllers, Authentication, dan Protected Routes. Pengujian akan memanipulasi (*mocking*) koneksi database sehingga aman untuk dieksekusi tanpa mengganggu data asli.
