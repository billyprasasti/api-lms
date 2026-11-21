const pool = require("./config/db");
const app = require("./app");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET belum diisi di file .env");
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 3000;

(async () => {
  try {
    await pool.query("SELECT 1"); // tes koneksi database sebelum server menerima request
    console.log(`Terhubung ke database ${process.env.DB_NAME} di ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
  } catch (e) {
    console.error("Gagal terhubung ke database:", e.message);
    process.exit(1);
  }
})();
