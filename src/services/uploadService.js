const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

// Langkah 7: konfigurasi multer. File disimpan ke folder `uploads` di root aplikasi.
const UPLOAD_DIR = path.join(__dirname, "../../uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  // Nama file dibuat acak (uuid) supaya tidak bentrok dan tidak memakai nama dari user
  filename: (req, file, cb) => cb(null, uuidv4() + ALLOWED[file.mimetype]),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // maksimal 5 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED[file.mimetype]) return cb(null, true);
    const err = new Error("File harus berupa gambar (jpg, png, webp, gif).");
    err.code = "INVALID_FILE_TYPE";
    cb(err);
  },
});

// Middleware yang menerima payload form-data dengan field bernama "file"
const uploadSingle = upload.single("file");

module.exports = { UPLOAD_DIR, uploadSingle };
