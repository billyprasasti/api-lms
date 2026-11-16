const pool = require("../config/db");

// Langkah 2: Data Manipulation Language (SELECT, INSERT, UPDATE, DELETE) untuk tabel courses.
// Semua query memakai parameter ($1, $2, ...) supaya aman dari SQL injection.

// Kolom yang boleh diisi/diubah dari luar (id, created_at, dst. diatur database)
const WRITABLE = [
  "category_id", "tutor_id", "title", "headline", "description", "thumbnail_url",
  "price", "duration_hours", "rating_avg", "review_count", "is_published",
];

// SELECT dasar: kelas + nama kategori + data tutor (JOIN)
const BASE_SELECT = `
  SELECT c.id, c.category_id, ca.slug AS category_slug, ca.name AS category_name,
         c.tutor_id, t.full_name AS tutor_name, t.job_title AS tutor_job_title, t.company AS tutor_company,
         c.title, c.headline, c.description, c.thumbnail_url,
         c.price, c.duration_hours, c.rating_avg, c.review_count, c.is_published,
         c.created_at, c.updated_at
  FROM courses c
  JOIN categories ca ON ca.id = c.category_id
  JOIN tutors t      ON t.id  = c.tutor_id`;

// SELECT * : semua kelas (opsional filter kategori, pencarian judul, dan pagination)
async function findAll({ category, search, page = 1, limit = 50 } = {}) {
  const where = [];
  const values = [];
  if (category) { values.push(category); where.push(`ca.slug = $${values.length}`); }
  if (search)   { values.push(`%${search}%`); where.push(`c.title ILIKE $${values.length}`); }

  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const offset = (Math.max(Number(page) || 1, 1) - 1) * safeLimit;
  values.push(safeLimit, offset);

  const sql = `${BASE_SELECT}
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY c.id DESC
    LIMIT $${values.length - 1} OFFSET $${values.length}`;
  const { rows } = await pool.query(sql, values);
  return rows;
}

// SELECT by id
async function findById(id) {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE c.id = $1`, [id]);
  return rows[0] ?? null;
}

// INSERT : tambah kelas baru, kembalikan data lengkapnya
async function create(data) {
  const cols = WRITABLE.filter((k) => data[k] !== undefined);
  const values = cols.map((k) => data[k]);
  const placeholders = cols.map((_, i) => `$${i + 1}`);
  const { rows } = await pool.query(
    `INSERT INTO courses (${cols.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING id`,
    values
  );
  return findById(rows[0].id);
}

// UPDATE by id : hanya kolom yang dikirim di payload yang diubah (cocok untuk PATCH)
// Mengembalikan: undefined (payload kosong), null (id tidak ada), atau data terbaru
async function update(id, data) {
  const cols = WRITABLE.filter((k) => data[k] !== undefined);
  if (cols.length === 0) return undefined;
  const sets = cols.map((k, i) => `${k} = $${i + 1}`);
  const values = [...cols.map((k) => data[k]), id];
  const { rowCount } = await pool.query(
    `UPDATE courses SET ${sets.join(", ")}, updated_at = now() WHERE id = $${values.length}`,
    values
  );
  return rowCount === 0 ? null : findById(id);
}

// DELETE by id : kembalikan true kalau ada baris yang terhapus
async function remove(id) {
  const { rowCount } = await pool.query("DELETE FROM courses WHERE id = $1", [id]);
  return rowCount > 0;
}

module.exports = { WRITABLE, findAll, findById, create, update, remove };
