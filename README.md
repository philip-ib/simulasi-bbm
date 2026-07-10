# ⛽ Aplikasi Simulasi BBM - Pertamina

Aplikasi simulasi pengisian BBM dengan panel admin untuk mengelola data kendaraan dan harga BBM.

## 🚀 Deploy ke Vercel (Langkah demi Langkah)

### Prasyarat

1. **Akun Vercel** - Daftar di https://vercel.com (login pake GitHub)
2. **Akun Neon** (PostgreSQL gratis) - Daftar di https://neon.tech
3. **GitHub** - Repo sudah terhubung

### Langkah 1: Setup Database PostgreSQL (Neon - GRATIS)

1. Buka https://neon.tech → Sign Up (Google/GitHub)
2. Buat project baru → pilih region terdekat (misal Singapore)
3. Copy **Connection String** yang muncul (mulai dengan `postgresql://...`)
4. Simpan connection string ini, akan dipakai nanti

### Langkah 2: Push Code ke GitHub

```bash
git add .
git commit -m "Fix konfigurasi untuk Vercel deploy"
git push
```

### Langkah 3: Deploy ke Vercel

1. Buka https://vercel.com → **Add New Project**
2. Import repository GitHub Anda
3. **Settings penting**:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (biarkan default)
   - **Build Command**: biarkan kosong
   - **Output Directory**: biarkan kosong

4. **Environment Variables** (WAJIB diisi):

   ```
   DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
   SECRET_KEY=buat_string_acak_panjang_untuk_jwt
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=123456
   ```

5. Klik **Deploy** ⚡

### Langkah 4: Selesai! 🎉

Aplikasi Anda akan live di `https://simulasi-bbm-pertamina.vercel.app`

### Troubleshooting

**Q: Masih "Gagal terhubung ke server backend"?**
A: Pastikan Environment Variables sudah diisi dengan benar di Vercel Dashboard:

- Buka project di Vercel → Settings → Environment Variables
- Tambahkan `DATABASE_URL` dan `SECRET_KEY`

**Q: Database error?**
A: Pastikan Neon database Anda aktif. Cek di Neon dashboard → project Anda → pastikan statusnya "Active"

**Q: Ingin deploy ulang?**
A: Cukup push perubahan ke GitHub, Vercel akan auto-deploy. Atau di Vercel Dashboard → Deployments → trigger Redeploy.

## 🏠 Development Lokal

```bash
# Install dependencies
npm install

# Buat file .env (copy dari .env.example)
cp .env.example backend/.env

# Isi .env dengan database PostgreSQL Anda
# Lalu jalankan:
npm start
```

## 🆓 Alternatif Hosting Lain

Jika Vercel tetap bermasalah, coba alternatif gratis ini:

| Platform        | Biaya            | Kelebihan                                                    |
| --------------- | ---------------- | ------------------------------------------------------------ |
| **Render.com**  | Gratis           | Web service + PostgreSQL gratis, support Express.js langsung |
| **Railway.app** | $5 credit gratis | Lebih stabil, tanpa sleep timer                              |
| **Fly.io**      | $5 credit/bulan  | Global deployment, support PostgreSQL                        |
| **Koyeb**       | Gratis           | Alternatif Render, mudah digunakan                           |

> **Rekomendasi**: Jika Vercel terus gagal, coba **Render.com** - paling mudah untuk full-stack app dengan database.
