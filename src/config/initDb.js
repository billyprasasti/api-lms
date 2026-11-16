// Menjalankan sql/01_schema.sql lalu sql/02_seed.sql ke database. Pemakaian: npm run db:init
const fs = require("fs");
const path = require("path");
const pool = require("./db");

(async () => {
  try {
    for (const file of ["01_schema.sql", "02_seed.sql"]) {
      const sql = fs.readFileSync(path.join(__dirname, "../../sql", file), "utf8");
      await pool.query(sql);
      console.log(`OK  ${file}`);
    }
  } catch (e) {
    console.error("Gagal menyiapkan database:", e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
