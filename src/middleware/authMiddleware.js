const jwt = require("jsonwebtoken");

// Langkah 4: memeriksa token JWT di header "Authorization: Bearer <token>"
function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ success: false, message: "Autentikasi gagal. Token tidak ditemukan." });
  }
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Autentikasi gagal. Format header harus: Bearer <token>." });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // secret sama dengan saat login
    next();
  } catch (err) {
    const message = err.name === "TokenExpiredError" ? "Autentikasi gagal. Token sudah kedaluwarsa." : "Autentikasi gagal. Token tidak valid.";
    res.status(401).json({ success: false, message });
  }
}

module.exports = { verifyToken };
