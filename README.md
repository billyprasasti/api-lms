# videobelajar API (Express + PostgreSQL)

Backend untuk mission "Database & REST API". Mengelola data kelas (`courses`) sesuai ERD.

## Struktur
```
src/
├── config/db.js            # Langkah 1: koneksi PostgreSQL dari .env (host, user, password, port, nama database)
├── config/initDb.js        # menjalankan sql/01_schema.sql + sql/02_seed.sql
├── services/courseService.js  # Langkah 2: SELECT (semua / by id), INSERT, UPDATE by id, DELETE by id
├── routes/courseRoutes.js     # Langkah 3: endpoint REST yang memanggil service
├── middleware/errorHandler.js # error PostgreSQL -> respons HTTP
├── app.js / server.js
sql/                        # 01_schema.sql (DDL dari ERD), 02_seed.sql (data awal 10 kelas)
postman/                    # Langkah 4: koleksi pengujian Postman
```

## Menjalankan
```bash
npm install
cp .env.example .env          # Windows: copy .env.example .env, lalu isi DB_PASSWORD dst.
createdb videobelajar         # atau buat database lewat pgAdmin
npm run db:init               # membuat tabel + mengisi data awal (sekali saja)
npm run dev                   # http://localhost:3000
```
Butuh Node.js 18+ dan PostgreSQL 13+ (skema memakai ekstensi `pg_trgm`).

## Endpoint
| Endpoint | Method | Keterangan |
|---|---|---|
| `/course` | GET | List semua kelas. Opsional: `?category=desain&search=react&page=1&limit=10` |
| `/course/:id` | GET | Satu kelas berdasarkan id |
| `/course` | POST | Tambah kelas (body JSON) |
| `/course/:id` | PATCH / PUT | Ubah kelas; cukup kirim field yang berubah |
| `/course/:id` | DELETE | Hapus kelas |

Contoh body POST:
```json
{
  "category_id": 5, "tutor_id": 3,
  "title": "Dasar-dasar Figma untuk Pemula",
  "headline": "UI/UX Design Fundamental",
  "description": "Belajar Figma dari nol sampai bisa membuat prototipe.",
  "price": 275000, "duration_hours": 5, "rating_avg": 4.5, "is_published": true
}
```
Respons selalu berbentuk `{ "success": true/false, "message": ..., "data": ... }`.
Kode status: 200 berhasil, 201 dibuat, 400 data tidak valid, 404 tidak ditemukan, 409 duplikat, 500 error server.

## Pengujian dengan Postman
1. Postman → Import → pilih `postman/videobelajar-api.postman_collection.json`.
2. Pastikan server berjalan; variabel `baseUrl` default `http://localhost:3000`.
3. Jalankan request 1 sampai 7 berurutan (atau **Run collection**). Tiap request punya test otomatis.
4. Folder **Kasus error** menguji 404 dan 400.

Catatan: kelas yang sudah punya order tidak bisa dihapus (FK `ON DELETE RESTRICT`); API membalas 400 dengan pesan yang jelas.
