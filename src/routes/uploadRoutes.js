const express = require("express");
const { uploadSingle } = require("../services/uploadService");

const router = express.Router();

// POST /upload  (form-data, field: file)
router.post("/", uploadSingle, (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "File wajib dikirim pada field 'file'." });
  const base = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  res.status(201).json({
    success: true,
    message: "File berhasil diunggah.",
    data: { filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype, url: `${base}/uploads/${req.file.filename}` },
  });
});

module.exports = router;
