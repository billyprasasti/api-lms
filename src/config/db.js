require("dotenv").config();
const { Pool } = require("pg");

// Langkah 1: koneksi database dari host, username, password, port, dan nama database (file .env)
const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Konfigurasi database belum lengkap, isi di file .env: ${missing.join(", ")}`);
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => console.error("Error pada koneksi database:", err.message));

module.exports = pool;
