// Menerjemahkan error PostgreSQL menjadi respons HTTP yang jelas
module.exports = (err, req, res, next) => {
  const map = {
    "23503": [400, "Data rujukan tidak valid (category_id/tutor_id tidak ada) atau data masih dipakai tabel lain."],
    "23505": [409, "Data duplikat: email atau username sudah terdaftar."],
    "23514": [400, "Nilai melanggar aturan data (mis. harga negatif)."],
    "22P02": [400, "Format data tidak valid."],
    "22003": [400, "Angka di luar batas yang diizinkan."],
    "23502": [400, "Ada kolom wajib yang belum diisi."],
  };
  if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ success: false, message: "Ukuran file maksimal 5 MB." });
  if (err.code === "LIMIT_UNEXPECTED_FILE") return res.status(400).json({ success: false, message: "Kirim file pada field bernama 'file'." });
  if (err.code === "INVALID_FILE_TYPE") return res.status(400).json({ success: false, message: err.message });
  if (err.type === "entity.parse.failed") return res.status(400).json({ success: false, message: "Body JSON tidak valid." });
  const [status, message] = map[err.code] ?? [500, "Terjadi kesalahan pada server."];
  if (status === 500) console.error(err);
  res.status(status).json({ success: false, message });
};
