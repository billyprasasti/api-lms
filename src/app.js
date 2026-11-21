const express = require("express");
const cors = require("cors");
const courseRoutes = require("./routes/courseRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const { UPLOAD_DIR } = require("./services/uploadService");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ success: true, message: "videobelajar API berjalan", endpoints: ["/register", "/login", "/verify-email", "/course", "/upload"] }));
app.use("/uploads", express.static(UPLOAD_DIR)); // gambar hasil upload bisa dibuka lewat URL

app.use(authRoutes);                                          // /register, /login, /verify-email
app.use("/course", authMiddleware.verifyToken, courseRoutes); // butuh token
app.use("/upload", authMiddleware.verifyToken, uploadRoutes); // butuh token

app.use((req, res) => res.status(404).json({ success: false, message: "Endpoint tidak ditemukan." }));
app.use(errorHandler);

module.exports = app;
