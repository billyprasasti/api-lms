-- Migrasi untuk database yang SUDAH dibuat dengan skema lama (tanpa username/verifikasi email).
-- Database baru tidak perlu file ini karena 01_schema.sql sudah memuatnya.
-- Jalankan: psql -U postgres -d videobelajar -f sql/03_users_auth_migration.sql
-- Catatan: kalau tabel users sudah berisi baris, isi dulu kolom username sebelum NOT NULL (di sini diisi dari e-mail).
BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(30);
UPDATE users SET username = left(split_part(email, '@', 1), 30) WHERE username IS NULL;
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT uq_users_username UNIQUE (username);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(36);
ALTER TABLE users ADD CONSTRAINT uq_users_verification_token UNIQUE (verification_token);
ALTER TABLE users ALTER COLUMN phone_country_code DROP NOT NULL;
ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL;
COMMIT;
