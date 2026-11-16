const express = require("express");
const courseService = require("../services/courseService");

// Langkah 3: REST API. Route hanya mengurus request/response; query ada di service.
const router = express.Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const isId = (v) => /^\d+$/.test(v);

// Ambil hanya field yang dikenal dari body
const pick = (body) =>
  Object.fromEntries(courseService.WRITABLE.filter((k) => body?.[k] !== undefined).map((k) => [k, body[k]]));

// Validasi payload; `full` true (POST) = kolom wajib harus ada
function validate(data, full) {
  const errors = [];
  const required = ["category_id", "tutor_id", "title", "headline", "description", "price", "duration_hours"];
  if (full) required.forEach((k) => data[k] === undefined && errors.push(`${k} wajib diisi.`));
  if (data.title !== undefined && !String(data.title).trim()) errors.push("title tidak boleh kosong.");
  if (data.price !== undefined && !(Number(data.price) >= 0)) errors.push("price harus angka >= 0.");
  if (data.duration_hours !== undefined && !(Number(data.duration_hours) > 0)) errors.push("duration_hours harus lebih dari 0.");
  if (data.rating_avg !== undefined && !(Number(data.rating_avg) >= 0 && Number(data.rating_avg) <= 5)) errors.push("rating_avg antara 0 sampai 5.");
  return errors;
}

// GET /course -> list semua kelas (?category=desain&search=react&page=1&limit=10)
router.get("/", wrap(async (req, res) => {
  const data = await courseService.findAll(req.query);
  res.json({ success: true, count: data.length, data });
}));

// GET /course/:id -> satu kelas
router.get("/:id", wrap(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "id harus berupa angka." });
  const course = await courseService.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: "Kelas tidak ditemukan." });
  res.json({ success: true, data: course });
}));

// POST /course -> tambah kelas (payload JSON)
router.post("/", wrap(async (req, res) => {
  const data = pick(req.body);
  const errors = validate(data, true);
  if (errors.length) return res.status(400).json({ success: false, message: "Data tidak valid.", errors });
  const created = await courseService.create(data);
  res.status(201).json({ success: true, message: "Kelas berhasil ditambahkan.", data: created });
}));

// PATCH /course/:id (juga PUT) -> ubah data kelas; payload hanya field yang berubah
const updateHandler = wrap(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "id harus berupa angka." });
  const data = pick(req.body);
  const errors = validate(data, false);
  if (errors.length) return res.status(400).json({ success: false, message: "Data tidak valid.", errors });
  const updated = await courseService.update(req.params.id, data);
  if (updated === undefined) return res.status(400).json({ success: false, message: "Tidak ada data yang diubah. Kirim minimal satu field." });
  if (updated === null) return res.status(404).json({ success: false, message: "Kelas tidak ditemukan." });
  res.json({ success: true, message: "Kelas berhasil diperbarui.", data: updated });
});
router.patch("/:id", updateHandler);
router.put("/:id", updateHandler);

// DELETE /course/:id -> hapus kelas
router.delete("/:id", wrap(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "id harus berupa angka." });
  const ok = await courseService.remove(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: "Kelas tidak ditemukan." });
  res.json({ success: true, message: "Kelas berhasil dihapus." });
}));

module.exports = router;
