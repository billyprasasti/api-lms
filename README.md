# videobelajar API (Express + PostgreSQL)

Backend untuk mission Node.js: REST API kelas, autentikasi (register/login JWT), verifikasi e-mail, query params, dan upload gambar.

## Struktur
```
src/
├── config/db.js, initDb.js
├── controllers/authController.js   # register, login, verifyEmail
├── services/userService.js         # INSERT/SELECT/UPDATE tabel users
├── services/courseService.js       # SELECT (filter, sort, search), INSERT, UPDATE, DELETE
├── services/mailService.js         # sendmail (nodemailer)
├── services/uploadService.js       # konfigurasi multer -> folder uploads/
├── middleware/authMiddleware.js    # verifyToken (JWT)
├── routes/authRoutes.js, courseRoutes.js, uploadRoutes.js
sql/   01_schema.sql, 02_seed.sql, 03_users_auth_migration.sql
uploads/                            # tempat file hasil upload
postman/
```

## Menjalankan
```bash
npm install
cp .env.example .env          # isi DB_PASSWORD dan JWT_SECRET (lihat petunjuk di dalam file)
createdb videobelajar         # atau buat database lewat pgAdmin
npm run db:init               # membuat tabel + mengisi data awal (database baru, sekali saja)
# Database SUDAH dibuat sebelumnya? Jalankan migrasi ini saja (menambah username & kolom verifikasi di users):
# psql -U postgres -d videobelajar -f sql/03_users_auth_migration.sql
npm run dev                   # http://localhost:3000
```
Butuh Node.js 18+ dan PostgreSQL 13+ (skema memakai ekstensi `pg_trgm`).

## Endpoint
| Endpoint | Method | Token? | Keterangan |
|---|---|---|---|
| `/register` | POST | tidak | Daftar. Body: `fullname`, `username`, `email`, `password` (min. 8 karakter) |
| `/login` | POST | tidak | Body: `email`, `password`. Mengembalikan `token` JWT |
| `/verify-email?token=...` | GET | tidak | Verifikasi akun dari token di e-mail (alias: `/verifikasi-email`) |
| `/course` | GET | ya | List kelas dengan query params (di bawah) |
| `/course/:id` | GET, PATCH/PUT, DELETE | ya | Satu kelas / ubah / hapus |
| `/course` | POST | ya | Tambah kelas |
| `/upload` | POST | ya | Upload gambar (form-data, field `file`, maks. 5 MB, jpg/png/webp/gif) |

Token dikirim lewat header `Authorization: Bearer <token>`.

**Query params `GET /course`**
| Param | Fungsi | Contoh |
|---|---|---|
| `topic` | filter kategori (slug: pemasaran, digital, pengembangan, bisnis, desain) | `?topic=desain` |
| `min_price`, `max_price` | filter rentang harga | `?max_price=300000` |
| `search` | cari di judul, sub-judul, atau nama tutor (LIKE, tidak peduli huruf besar/kecil) | `?search=react` |
| `sortBy` + `order` | urut: `title`, `price`, `rating`, `duration`, `newest`; `order` = `asc`/`desc` | `?sortBy=price&order=asc` |
| `page`, `limit` | pagination (limit maks. 100) | `?page=2&limit=10` |

Semua bisa digabung: `/course?topic=desain&search=antarmuka&sortBy=rating&order=desc`

## Alur verifikasi e-mail
1. `/register` membuat token (uuid), menyimpannya di kolom `users.verification_token`, lalu mengirimnya lewat nodemailer.
2. User membuka link di e-mail (`/verify-email?token=...`). Token valid: `is_verified` menjadi true dan token dihapus, respons "Email Verified Successfully". Token tidak ditemukan: "Invalid Verification Token".
3. Kalau `MAIL_HOST` di `.env` kosong, e-mail tidak dikirim dan link verifikasi dicetak di terminal server, jadi tetap bisa dites tanpa SMTP. Untuk kirim sungguhan isi `MAIL_*` (Gmail memakai App Password, atau pakai Mailtrap untuk uji coba).
4. `REQUIRE_VERIFIED_EMAIL=true` membuat login ditolak (403) sampai e-mail diverifikasi. Default `false`.

Kode status: 200 berhasil, 201 dibuat, 400 data tidak valid, 401 token/login salah, 403 e-mail belum terverifikasi, 404 tidak ditemukan, 409 duplikat (email/username), 413 file terlalu besar, 500 error server.

## Pengujian dengan Postman
1. Import `postman/videobelajar-api.postman_collection.json`. `baseUrl` default `http://localhost:3000`.
2. Folder **Auth**: jalankan A1 (register). Salin token verifikasi dari e-mail atau terminal server ke variabel koleksi `verifyToken`, lalu jalankan A5. Jalankan A6 (login): token otomatis tersimpan dan dipakai semua request lain.
3. Jalankan request 1 sampai 7, folder **Kasus error**, lalu **Query params & Upload**. Pada request 12 pilih file gambar di tab Body (form-data, key `file`).

Catatan: kelas yang sudah punya order tidak bisa dihapus (FK `ON DELETE RESTRICT`); API membalas 400.
