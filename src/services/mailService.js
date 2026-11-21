const nodemailer = require("nodemailer");

// Langkah 6: function sendmail memakai nodemailer.
// Tanpa MAIL_HOST, e-mail tidak dikirim; link verifikasi dicetak ke terminal supaya tetap bisa dites.
function createTransport() {
  if (!process.env.MAIL_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: Number(process.env.MAIL_PORT) === 465,
    auth: process.env.MAIL_USER ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS } : undefined,
  });
}

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Mengirim token verifikasi ke e-mail user. Mengembalikan true kalau benar-benar terkirim.
async function sendVerificationEmail({ to, fullName, token }) {
  const link = `${process.env.APP_URL || "http://localhost:3000"}/verify-email?token=${token}`;
  const transport = createTransport();
  if (!transport) {
    console.log(`[mail] MAIL_HOST belum diisi, e-mail ke ${to} tidak dikirim. Link verifikasi: ${link}`);
    return false;
  }
  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject: "Verifikasi akun videobelajar",
    text: `Halo ${fullName},\n\nKlik link berikut untuk memverifikasi akunmu:\n${link}\n\nToken verifikasi: ${token}`,
    html: `<p>Halo ${escapeHtml(fullName)},</p><p>Klik tombol di bawah untuk memverifikasi akunmu.</p>
           <p><a href="${link}" style="background:#3ecf4c;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Verifikasi Email</a></p>
           <p>Atau salin link ini: ${link}</p>`,
  });
  return true;
}

module.exports = { sendVerificationEmail };
