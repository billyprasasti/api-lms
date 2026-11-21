const pool = require("../config/db");

// Query tabel users (INSERT / SELECT / UPDATE). Password yang masuk ke sini sudah berupa hash bcrypt.

// INSERT user baru beserta token verifikasi (Langkah 2 dan 6)
async function create({ fullName, username, email, passwordHash, verificationToken }) {
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, username, email, password_hash, verification_token)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, username, email, is_verified, created_at`,
    [fullName, username, email, passwordHash, verificationToken]
  );
  return rows[0];
}

// SELECT berdasarkan email (dipakai login). E-mail dibandingkan tanpa peduli huruf besar/kecil.
async function findByEmail(email) {
  const { rows } = await pool.query("SELECT * FROM users WHERE lower(email) = lower($1)", [email]);
  return rows[0] ?? null;
}

// Cari user berdasarkan token verifikasi; kalau ketemu langsung tandai terverifikasi dan hapus token
async function verifyByToken(token) {
  const { rows } = await pool.query(
    `UPDATE users SET is_verified = true, verification_token = NULL, updated_at = now()
     WHERE verification_token = $1
     RETURNING id, email, is_verified`,
    [token]
  );
  return rows[0] ?? null;
}

module.exports = { create, findByEmail, verifyByToken };
