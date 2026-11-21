const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const userService = require("../services/userService");
const mailService = require("../services/mailService");

const SALT_ROUNDS = 10;
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

// POST /register  (Langkah 2 + 6)
async function register(req, res, next) {
  try {
    const { fullname, username, email, password } = req.body ?? {};
    const errors = [];
    if (!fullname || !String(fullname).trim()) errors.push("fullname wajib diisi.");
    if (!USERNAME_RE.test(username ?? "")) errors.push("username 3-30 karakter, hanya huruf, angka, dan underscore.");
    if (!EMAIL_RE.test(email ?? "")) errors.push("format email tidak valid.");
    if (typeof password !== "string" || password.length < 8) errors.push("password minimal 8 karakter.");
    if (errors.length) return res.status(400).json({ success: false, message: "Data tidak valid.", errors });

    // Password dienkripsi dulu dengan bcrypt, yang disimpan hanya hash-nya
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const verificationToken = uuidv4();

    const user = await userService.create({
      fullName: String(fullname).trim(),
      username,
      email: String(email).trim().toLowerCase(),
      passwordHash,
      verificationToken,
    });

    // Kirim e-mail verifikasi. Kegagalan kirim tidak membatalkan pendaftaran.
    let emailSent = false;
    try {
      emailSent = await mailService.sendVerificationEmail({ to: user.email, fullName: user.full_name, token: verificationToken });
    } catch (e) {
      console.error("Gagal mengirim e-mail verifikasi:", e.message);
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? "Registrasi berhasil. Cek e-mail kamu untuk verifikasi akun."
        : "Registrasi berhasil, tetapi e-mail verifikasi belum terkirim.",
      emailSent,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

// POST /login  (Langkah 3)
async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email dan password wajib diisi." });
    }

    // Pesan sengaja sama untuk "email tidak ada" dan "password salah" agar tidak membocorkan email yang terdaftar
    const invalid = () => res.status(401).json({ success: false, message: "Email atau password salah." });

    const user = await userService.findByEmail(String(email));
    if (!user) return invalid();

    const match = await bcrypt.compare(String(password), user.password_hash);
    if (!match) return invalid();

    if (process.env.REQUIRE_VERIFIED_EMAIL === "true" && !user.is_verified) {
      return res.status(403).json({ success: false, message: "Email belum diverifikasi. Cek e-mail kamu." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.json({
      success: true,
      message: "Login berhasil.",
      token,
      data: { id: user.id, fullname: user.full_name, username: user.username, email: user.email, is_verified: user.is_verified },
    });
  } catch (err) {
    next(err);
  }
}

// GET /verify-email?token=...  (Langkah 6)
async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query;
    const user = token ? await userService.verifyByToken(String(token)) : null;
    if (!user) return res.status(400).json({ success: false, message: "Invalid Verification Token" });
    res.json({ success: true, message: "Email Verified Successfully" });
  } catch (err) {
    // token yang bukan format uuid tidak mungkin ada di database
    if (err.code === "22P02") return res.status(400).json({ success: false, message: "Invalid Verification Token" });
    next(err);
  }
}

module.exports = { register, login, verifyEmail };
